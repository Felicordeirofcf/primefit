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
  // Loading state: true initially, false after initial check or auth event.
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!user;
  const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);

  // useCallback ensures this function has a stable reference.
  // Fetches user profile and admin status from Supabase.
  const fetchUserProfileAndAdminStatus = useCallback(async (userId, userEmail) => {
    if (!userId || !userEmail) {
      console.log('fetchUserProfileAndAdminStatus: userId or userEmail missing, clearing state.');
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    console.log(`fetchUserProfileAndAdminStatus: Fetching for userId: ${userId}`);
    try {
      const [profileResponse, adminResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('is_admin_by_email', { user_email: userEmail })
      ]);

      // Handle profile response
      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileResponse.error);
        setUserProfile(prev => ({ ...(prev || {}), id: userId, email: userEmail, nome: prev?.nome || userEmail.split('@')[0] || 'Usuário' }));
      } else if (profileResponse.data) {
        console.log('Perfil encontrado:', profileResponse.data);
        setUserProfile(profileResponse.data);
      } else {
         console.log('Perfil não encontrado, usando perfil básico');
         setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' });
      }

      // Handle admin status response
      if (adminResponse.error) {
        console.error('Erro ao verificar admin:', adminResponse.error);
        setIsAdmin(false);
      } else {
        console.log('Resultado admin por email:', adminResponse.data);
        setIsAdmin(adminResponse.data === true);
      }

    } catch (error) {
      console.error('Erro geral ao buscar perfil/admin:', error);
      setUserProfile(prev => ({ ...(prev || {}), id: userId, email: userEmail, nome: prev?.nome || userEmail.split('@')[0] || 'Usuário', role: prev?.role || 'cliente' }));
      setIsAdmin(false);
    }
  }, []); // Empty dependency array: Function reference is stable.

  // Effect to handle initial session check and auth state changes.
  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;
    console.log("AuthContext useEffect: Mounting. Setting up initial check and listener.");
    setLoading(true);

    // Check initial session state on mount
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (!isMounted) {
        console.log("Initial getSession: Unmounted before completion.");
        return;
      }
      if (sessionError) {
        console.error('Erro ao obter sessão inicial via getSession:', sessionError);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } else if (session?.user) {
        console.log('Sessão inicial encontrada via getSession:', session.user.id);
        setUser(session.user);
        await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
      } else {
        console.log('Nenhuma sessão inicial encontrada via getSession.');
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      // Set loading to false ONLY after the initial session check is complete.
      console.log("Initial getSession: Finished, setting loading to false.");
      setLoading(false);
    }).catch(error => {
      if (isMounted) {
        console.error('Erro catastrófico na verificação de sessão inicial (getSession):', error);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Set up the listener for subsequent auth state changes.
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) {
        console.log(`onAuthStateChange: Received event ${event} but component unmounted.`);
        return;
      }

      console.log(`onAuthStateChange: Event received - ${event}, User ID: ${session?.user?.id}`);

      switch (event) {
        case 'SIGNED_IN':
          console.log('Handling SIGNED_IN event.');
          // Avoid setting loading here if getSession already handled it, unless necessary.
          // setLoading(true); 
          setUser(session.user);
          await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
          // setLoading(false);
          break;
        case 'SIGNED_OUT':
          console.log('Handling SIGNED_OUT event.');
          setUser(null);
          setUserProfile(null);
          setIsAdmin(null);
          setLoading(false); // Ensure loading is false on sign out.
          break;
        case 'TOKEN_REFRESHED':
          console.log('Handling TOKEN_REFRESHED event.');
          if (session?.user) {
            // Update user object only if it has actually changed.
            setUser(currentUser => {
              if (JSON.stringify(currentUser) !== JSON.stringify(session.user)) {
                console.log('User object updated after token refresh.');
                return session.user;
              }
              return currentUser;
            });
            // Optionally re-fetch profile if needed based on token claims.
            // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
          } else {
            console.warn('TOKEN_REFRESHED event with null session, treating as SIGNED_OUT.');
            setUser(null);
            setUserProfile(null);
            setIsAdmin(null);
            setLoading(false);
          }
          break;
        case 'USER_UPDATED':
          console.log('Handling USER_UPDATED event.');
          if (session?.user) {
              setUser(session.user);
              // Optionally refetch profile if needed after user update (e.g., email change).
              // setLoading(true);
              // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
              // setLoading(false);
          }
          break;
        case 'PASSWORD_RECOVERY':
          console.log('Handling PASSWORD_RECOVERY event.');
          // Typically, no state change needed here, user follows email link.
          break;
        // INITIAL_SESSION is often redundant if getSession() is used reliably on mount.
        // If needed, ensure it doesn't conflict with the initial getSession logic.
        case 'INITIAL_SESSION':
           console.log('Handling INITIAL_SESSION event (usually handled by getSession).');
           // Avoid setting state here if getSession already did, prevents potential race conditions.
           break;
        default:
          console.log(`Unhandled auth event: ${event}`);
      }
    });

    authSubscription = data.subscription;

    // Cleanup function: Runs when the component unmounts.
    return () => {
      console.log("AuthContext useEffect: Unmounting and cleaning up listener.");
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
        console.log('Auth listener unsubscribed successfully.');
      } else {
        console.warn('Attempted to unsubscribe, but subscription was not properly set.');
      }
    };
  // Corrected Dependency Array: Only include stable functions like fetchUserProfileAndAdminStatus.
  // This ensures the effect runs only ONCE on mount and cleans up on unmount.
  }, [fetchUserProfileAndAdminStatus]);

  // --- Auth Actions --- 

  const signIn = async (email, password) => {
    console.log(`signIn: Attempting login for ${email}`);
    // setLoading(true); // Let onAuthStateChange handle loading state.
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('Login request successful.');
      // State updates handled by the listener.
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      setLoading(false); // Ensure loading is false on error.
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    console.log(`signUp: Attempting signup for ${email}`);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } });
      if (error) throw error;
      console.log('Signup request successful.');
      // State changes might occur later via listener (e.g., after email confirmation).
      return { data, error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isLoggingOut) {
      console.log("signOut: Already logging out.");
      return { error: null };
    }
    console.log("signOut: Attempting...");
    setIsLoggingOut(true);
    // setLoading(true); // Let listener handle SIGNED_OUT state.
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.message !== 'Auth session missing!') {
          console.error('Erro no Supabase signOut:', error);
      }
      console.log("Supabase sign out completed or session was missing.");
      // Manually clear state for responsiveness, listener will confirm.
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado durante o logout:', error);
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error };
    } finally {
      setIsLoggingOut(false);
      setLoading(false); // Ensure loading is false.
      console.log("signOut: Function finished.");
    }
  };

  const updateProfile = async (updates) => {
    if (!user) {
      console.error("updateProfile: User not authenticated.");
      throw new Error('Usuário não autenticado');
    }
    // setLoading(true); // Optional loading indicator.
    try {
      console.log('updateProfile: Updating with:', updates);
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
        console.log("updateProfile: No valid data provided for update.");
        return { data: userProfile, error: null };
      }

      console.log('updateProfile: Mapped data for Supabase:', profileData);
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
      // setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    console.log(`resetPassword: Requesting for email: ${email}`);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // redirectTo: 'YOUR_PASSWORD_RESET_PAGE_URL',
      });
      if (error) throw error;
      console.log("Password reset email sent successfully.");
      return { error: null };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  const getSessionToken = async () => {
    console.log("getSessionToken: Attempting to get session token.");
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao obter token da sessão:', error);
        return null;
      }
      const token = session?.access_token || null;
      console.log(`getSessionToken: Token ${token ? 'found' : 'not found'}.`);
      return token;
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  };

  // Memoize the context value to prevent unnecessary re-renders.
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
  }), [user, userProfile, loading, isAdmin, isAuthenticated, isProfileComplete, 
      signIn, signUp, signOut, updateProfile, resetPassword, getSessionToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

