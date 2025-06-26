import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI, profilesAPI } from '../api/apiClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!user;
  const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);

  const fetchUserProfileAndAdminStatus = useCallback(async (userId, userEmail) => {
    if (!userId || !userEmail) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await profilesAPI.getMyProfile();
      const isAdminByEmail = userEmail === 'felpcordeirofcf@gmail.com';

      if (profileError) {
        setUserProfile({
          id: userId,
          email: userEmail,
          nome: userEmail.split('@')[0] || 'Usuário',
          role: isAdminByEmail ? 'admin' : 'cliente'
        });
      } else if (profileData) {
        if (isAdminByEmail && profileData.role !== 'admin') {
          profileData.role = 'admin';
        }
        setUserProfile(profileData);
      } else {
        setUserProfile({
          id: userId,
          email: userEmail,
          nome: userEmail.split('@')[0] || 'Usuário',
          role: isAdminByEmail ? 'admin' : 'cliente'
        });
      }

      setIsAdmin(profileData?.role === 'admin' || isAdminByEmail);
    } catch (error) {
      const isAdminByEmail = userEmail === 'felpcordeirofcf@gmail.com';
      setUserProfile({
        id: userId,
        email: userEmail,
        nome: userEmail.split('@')[0] || 'Usuário',
        role: isAdminByEmail ? 'admin' : 'cliente'
      });
      setIsAdmin(isAdminByEmail);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const checkInitialSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp && payload.exp < currentTime) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
          } else {
            const parsedUserData = JSON.parse(userData);
            setUser({
              id: payload.user_id,
              email: payload.sub,
              role: payload.role
            });
            setUserProfile(parsedUserData);
            setIsAdmin(payload.role === 'admin' || payload.sub === 'felpcordeirofcf@gmail.com');
            fetchUserProfileAndAdminStatus(payload.user_id, payload.sub);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkInitialSession();

    return () => {
      isMounted = false;
    };
  }, [fetchUserProfileAndAdminStatus]);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await authAPI.login(email, password);
      if (error) throw new Error(error);

      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      const userData = {
        id: payload.user_id,
        email: payload.sub,
        role: payload.role
      };

      setUser(userData);
      await fetchUserProfileAndAdminStatus(userData.id, userData.email);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const { data, error } = await authAPI.register(userData);
      if (error) throw new Error(error);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isLoggingOut) return { error: null };
    setIsLoggingOut(true);
    setLoading(true);
    try {
      const { error } = await authAPI.logout();
      if (error) throw new Error(error);
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error: null };
    } catch (error) {
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error };
    } finally {
      setIsLoggingOut(false);
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Usuário não autenticado');
    setLoading(true);
    try {
      const profileData = {
        nome: updates.full_name || updates.nome,
        data_nascimento: updates.birth_date || updates.data_nascimento,
        telefone: updates.phone || updates.telefone,
        objetivo: updates.goal || updates.objetivo,
        altura: updates.height ? parseFloat(updates.height) / 100 : updates.altura,
        peso_inicial: updates.weight ? parseFloat(updates.weight) : updates.peso_inicial,
        condicoes_saude: updates.health_conditions || updates.condicoes_saude
      };
      Object.keys(profileData).forEach(key => (profileData[key] === undefined || profileData[key] === null || profileData[key] === '') && delete profileData[key]);

      if (Object.keys(profileData).length === 0) return { data: userProfile, error: null };

      const { data, error } = await profilesAPI.updateProfile(profileData);
      if (error) throw new Error(error);

      setUserProfile(data);
      localStorage.setItem('user_data', JSON.stringify(data));
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await authAPI.resetPassword(email);
      if (error) throw new Error(error);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getSessionToken = async () => {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      return null;
    }
  };

  const value = React.useMemo(() => ({
    user,
    userProfile,
    loading,
    isAdmin,
    isAuthenticated,
    isProfileComplete,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    getSessionToken
  }), [user, userProfile, loading, isAdmin, isAuthenticated, isProfileComplete]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
