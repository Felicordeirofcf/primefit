import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  // Loading state now tracks initial session check AND profile fetch status
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null); // null = unknown, false = not admin, true = admin
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ref to track if the initial fetch is done to prevent race conditions with listener
  const initialCheckCompleted = useRef(false);

  const isAuthenticated = !!user;
  const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);

  // --- Fetch User Profile and Admin Status --- 
  // Wrapped in useCallback to ensure stable reference for the main useEffect
  const fetchUserProfileAndAdminStatus = useCallback(async (userId, userEmail) => {
    if (!userId || !userEmail) {
      setUserProfile(null);
      setIsAdmin(false);
      return { profile: null, adminStatus: false }; // Return status
    }

    // Indicate loading specifically for profile/admin fetch
    // setLoading(true); // Consider if this loading state is needed or causes flicker

    try {
      console.log('Buscando perfil e status de admin para:', userId);
      const [profileResponse, adminResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('is_admin_by_email', { user_email: userEmail })
      ]);

      let fetchedProfile = null;
      let fetchedAdminStatus = false;

      // Process Profile
      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileResponse.error);
        fetchedProfile = { id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' }; // Fallback
      } else if (profileResponse.data) {
        console.log('Perfil encontrado:', profileResponse.data);
        fetchedProfile = profileResponse.data;
      } else {
        console.log('Perfil não encontrado, usando perfil básico');
        fetchedProfile = { id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' }; // Basic profile
      }

      // Process Admin Status
      if (adminResponse.error) {
        console.error('Erro ao verificar admin:', adminResponse.error);
        fetchedAdminStatus = false;
      } else {
        console.log('Resultado admin por email:', adminResponse.data);
        fetchedAdminStatus = adminResponse.data === true;
      }

      // Update state *after* both fetches are done
      setUserProfile(fetchedProfile);
      setIsAdmin(fetchedAdminStatus);
      return { profile: fetchedProfile, adminStatus: fetchedAdminStatus }; // Return status

    } catch (error) {
      console.error('Erro geral ao buscar perfil/admin:', error);
      // Set fallback state on general error
      setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' });
      setIsAdmin(false);
      return { profile: null, adminStatus: false }; // Return error status
    } finally {
      // setLoading(false); // Stop loading indicator if it was started
    }
  }, []); // Empty dependency array: function reference is stable

  // --- Effect for Initial Session Check and Auth Listener Setup --- 
  // This useEffect should ONLY run ONCE on mount to set up the listener
  useEffect(() => {
    let isMounted = true;
    initialCheckCompleted.current = false; // Reset on mount (though it should only mount once)
    setLoading(true); // Start loading for the initial check

    // 1. Check Initial Session
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (!isMounted) return;

      try {
        if (sessionError) {
          console.error('Erro ao obter sessão inicial:', sessionError);
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        } else if (session?.user) {
          console.log('Sessão inicial encontrada:', session.user.id);
          setUser(session.user);
          // Fetch profile immediately after finding session
          await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        } else {
          console.log('Nenhuma sessão inicial encontrada.');
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro no processamento da sessão inicial ou fetch de perfil:', error);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } finally {
        if (isMounted) {
          initialCheckCompleted.current = true; // Mark initial check as done
          setLoading(false); // Set loading false ONLY after initial check AND profile fetch attempt
        }
      }
    });

    // 2. Setup Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Wait for initial check to complete before processing listener events
      // This helps prevent race conditions where the listener fires before getSession resolves
      if (!isMounted || !initialCheckCompleted.current) {
          console.log(`Listener event (${event}) ignored: isMounted=${isMounted}, initialCheckCompleted=${initialCheckCompleted.current}`);
          return;
      }

      console.log('Auth state changed:', event, session?.user?.id);

      // Set loading true only for significant state changes needing profile fetch
      if (event === 'SIGNED_IN') {
        setLoading(true);
        setUser(session.user);
        await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        // Clear state immediately, don't show loading for logout
        setUser(null);
        setUserProfile(null);
        setIsAdmin(null); // Reset admin status
        setLoading(false); // Ensure loading is false
      } else if (event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log('Token refreshed for user:', session.user.id);
          // Update user object minimally if needed, avoid triggering cascades
          setUser(currentUser => 
            JSON.stringify(currentUser) !== JSON.stringify(session.user) ? session.user : currentUser
          );
          // **NO LOADING STATE CHANGE HERE**
          // Optionally re-fetch profile ONLY if critical claims might change
          // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        } else {
           console.warn('TOKEN_REFRESHED event with null session, treating as SIGNED_OUT.');
           setUser(null);
           setUserProfile(null);
           setIsAdmin(null);
           setLoading(false);
        }
      } else if (event === 'USER_UPDATED') {
          if (session?.user) {
              console.log('USER_UPDATED event for:', session.user.id);
              setUser(session.user);
              // Re-fetch profile as user data might have changed
              setLoading(true);
              await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
              setLoading(false);
          }
      } else if (event === 'INITIAL_SESSION') {
          // This event is often redundant with getSession(), but handle defensively
          console.log('INITIAL_SESSION event received.');
          if (session?.user && !user) { // Only act if user isn't already set by getSession
              console.log('Setting user based on INITIAL_SESSION event.');
              setLoading(true);
              setUser(session.user);
              await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
              setLoading(false);
          } else if (!session?.user && user) {
              console.warn('INITIAL_SESSION event with null session when user was set, signing out.');
              setUser(null);
              setUserProfile(null);
              setIsAdmin(null);
              setLoading(false);
          }
      }
      // Add other event handlers (PASSWORD_RECOVERY, etc.) if needed
    });

    // Cleanup function for the useEffect
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      console.log('Auth listener unsubscribed.');
    };
  // **CRITICAL CHANGE**: Dependency array only includes the stable fetch function reference.
  // The effect now runs only once on mount.
  }, [fetchUserProfileAndAdminStatus]); 

  // --- Auth Actions (Mostly unchanged, ensure loading state is managed reasonably) --- 

  const signIn = async (email, password) => {
    // setLoading(true); // Let onAuthStateChange handle loading state
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('Login request successful for:', email);
      // State updates are handled by the listener
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      setLoading(false); // Ensure loading stops on login error
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true); // Show loading during signup
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } });
      if (error) throw error;
      console.log('Signup request successful for:', email);
      // May require email confirmation, state might not change immediately
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
    // setLoading(true); // Optional: show loading during logout?
    try {
      console.log("Attempting Supabase sign out...");
      const { error } = await supabase.auth.signOut();
      if (error && error.message !== 'Auth session missing!') {
          console.error('Erro no Supabase signOut:', error);
      }
      console.log("Supabase sign out completed or session was missing.");
      // Manually clear state immediately for responsiveness, listener will also fire
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado durante o logout:', error);
      setUser(null); // Ensure state is cleared on unexpected error
      setUserProfile(null);
      setIsAdmin(null);
      return { error };
    } finally {
      setIsLoggingOut(false);
      setLoading(false); // Ensure loading is false after attempt
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
        return { data: userProfile, error: null };
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
      setUserProfile(data); // Update local state
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

  // --- Context Value --- 
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

