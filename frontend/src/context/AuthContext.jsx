import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

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
  // Start loading as true only for the very initial load
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
      console.log('Buscando perfil e status de admin para:', userId);
      const [profileResponse, adminResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('is_admin_by_email', { user_email: userEmail })
      ]);

      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileResponse.error);
        // Use fallback profile but keep existing role if available
        setUserProfile(prev => ({ ...prev, id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário' }));
      } else if (profileResponse.data) {
        console.log('Perfil encontrado:', profileResponse.data);
        setUserProfile(profileResponse.data);
      } else {
         console.log('Perfil não encontrado, usando perfil básico');
         setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' });
      }

      if (adminResponse.error) {
        console.error('Erro ao verificar admin:', adminResponse.error);
        setIsAdmin(false);
      } else {
        console.log('Resultado admin por email:', adminResponse.data);
        setIsAdmin(adminResponse.data === true);
      }

    } catch (error) {
      console.error('Erro geral ao buscar perfil/admin:', error);
      setUserProfile(prev => ({ ...prev, id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' }));
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true); // Start loading for initial check

    const checkInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          console.error('Erro ao obter sessão inicial:', sessionError);
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        } else if (session?.user) {
          console.log('Sessão inicial encontrada:', session.user.id);
          setUser(session.user);
          await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        } else {
          console.log('Nenhuma sessão inicial encontrada.');
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erro na verificação de sessão inicial:', error);
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          // Set loading false ONLY after the initial check is complete
          setLoading(false);
        }
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('Auth state changed:', event, session?.user?.id);

      // --- Handle different auth events --- 
      if (event === 'SIGNED_IN') {
        // Set loading true only if user is changing significantly or profile needs fetch
        setLoading(true);
        setUser(session.user);
        await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        // Don't set loading=true here, logout should be quick state clear
        setUser(null);
        setUserProfile(null);
        setIsAdmin(null); // Reset admin status on logout
        // setLoading(false); // Ensure loading is false if it was somehow true
      } else if (event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log('Token refreshed for user:', session.user.id);
          // Only update user object if it's different, avoid unnecessary state changes
          setUser(currentUser => {
            if (JSON.stringify(currentUser) !== JSON.stringify(session.user)) {
              return session.user;
            }
            return currentUser;
          });
          // ** CRITICAL CHANGE: Do NOT set loading to true/false here **
          // Token refresh should happen in the background without disrupting the UI
          // If profile *must* be refetched based on token claims, do it here, but
          // be mindful it could cause loading states.
          // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        } else {
           // If TOKEN_REFRESHED event occurs but session is null, treat as sign out
           console.warn('TOKEN_REFRESHED event with null session, treating as SIGNED_OUT.');
           setUser(null);
           setUserProfile(null);
           setIsAdmin(null);
        }
      } else if (event === 'INITIAL_SESSION') {
        // This event might fire alongside SIGNED_IN or TOKEN_REFRESHED after initial load
        // Usually, we rely on getSession() for the initial state.
        // If session exists here, ensure user state is consistent.
        console.log('INITIAL_SESSION event received.');
        if (session?.user && !user) { // Only act if user isn't already set
          console.log('Setting user based on INITIAL_SESSION event.');
          setLoading(true);
          setUser(session.user);
          await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
          setLoading(false);
        } else if (!session?.user && user) {
           // If INITIAL_SESSION has no user but we thought we had one, sign out
           console.warn('INITIAL_SESSION event with null session, signing out.');
           setUser(null);
           setUserProfile(null);
           setIsAdmin(null);
        }
      } else if (event === 'USER_UPDATED') {
          if (session?.user) {
              console.log('USER_UPDATED event for:', session.user.id);
              setUser(session.user);
              // Optionally refetch profile if needed after user update
              // setLoading(true);
              // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
              // setLoading(false);
          }
      }
      // Add handling for other events like PASSWORD_RECOVERY if needed
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      console.log('Auth listener unsubscribed.');
    };
  }, [fetchUserProfileAndAdminStatus, user]); // Added 'user' to dependency array to react correctly if INITIAL_SESSION finds no user when 'user' state was previously set.

  // --- Auth Actions --- 

  const signIn = async (email, password) => {
    // setLoading(true); // Let onAuthStateChange handle loading
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('Login request successful for:', email);
      // onAuthStateChange will handle setting user, profile and loading state
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      // setLoading(false); // Ensure loading is false on error if not handled by listener
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true); // Set loading during signup process
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } });
      if (error) throw error;
      console.log('Signup request successful for:', email);
      // User might need email confirmation. State might not change until confirmation.
      return { data, error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isLoggingOut) return { error: null };
    setIsLoggingOut(true);
    // setLoading(true); // Let onAuthStateChange handle loading state if needed
    try {
      console.log("Attempting Supabase sign out...");
      const { error } = await supabase.auth.signOut();
      if (error && error.message !== 'Auth session missing!') {
          console.error('Erro no Supabase signOut:', error);
          // Don't throw, but log the error. State will be cleared locally anyway.
      }
      console.log("Supabase sign out completed or session was missing.");
      // Manually clear local state immediately for responsiveness
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado durante o logout:', error);
      // Still clear local state
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error };
    } finally {
      setIsLoggingOut(false);
      // setLoading(false); // Ensure loading is false
      console.log("SignOut function finished.");
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Usuário não autenticado');
    // setLoading(true); // Optional: Indicate loading
    try {
      console.log('Atualizando perfil com:', updates);
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

      if (Object.keys(profileData).length === 0) {
        console.log("Nenhum dado válido para atualizar o perfil.");
        return { data: userProfile, error: null }; // Return current profile if no changes
      }

      console.log('Dados mapeados para update:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Perfil atualizado no banco:', data);
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    } finally {
      // setLoading(false); // Optional: Stop loading
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  const getSessionToken = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao obter token da sessão:', error);
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  };

  const value = {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

