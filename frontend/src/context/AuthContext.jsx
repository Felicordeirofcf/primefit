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
  const [loading, setLoading] = useState(true); // Start as true
  const [isAdmin, setIsAdmin] = useState(null); // Start as null to indicate unknown status
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Flag to prevent multiple logout calls

  // Derived properties
  const isAuthenticated = !!user;
  const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);

  // --- Fetch User Profile and Admin Status --- 
  const fetchUserProfileAndAdminStatus = useCallback(async (userId, userEmail) => {
    if (!userId || !userEmail) {
      setUserProfile(null);
      setIsAdmin(false);
      return; // No user, clear profile and admin status
    }

    try {
      console.log('Buscando perfil e status de admin para:', userId);
      // Fetch profile and admin status in parallel
      const [profileResponse, adminResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('is_admin_by_email', { user_email: userEmail })
      ]);

      // Process Profile Response
      if (profileResponse.error) {
        if (profileResponse.error.code === 'PGRST116') {
          console.log('Perfil não encontrado, usando perfil básico');
          setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' });
        } else {
          console.error('Erro ao buscar perfil:', profileResponse.error);
          setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' }); // Fallback
        }
      } else {
        console.log('Perfil encontrado:', profileResponse.data);
        setUserProfile(profileResponse.data);
      }

      // Process Admin Status Response
      if (adminResponse.error) {
        console.error('Erro ao verificar admin:', adminResponse.error);
        setIsAdmin(false);
      } else {
        console.log('Resultado admin por email:', adminResponse.data);
        setIsAdmin(adminResponse.data === true);
      }

    } catch (error) {
      console.error('Erro geral ao buscar perfil/admin:', error);
      setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' }); // Fallback
      setIsAdmin(false);
    }
  }, []); // useCallback dependencies are empty as it uses args

  // --- Effect for Session Handling --- 
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    setLoading(true); // Ensure loading is true when effect runs

    const checkSessionAndSetupListener = async () => {
      try {
        // 1. Check initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return; // Exit if component unmounted

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
          // No initial session
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
          // *** CRITICAL: Set loading false ONLY after initial check AND profile fetch attempt ***
          setLoading(false);
        }
      }

      // 2. Setup Auth State Change Listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return; // Exit if component unmounted

        console.log('Auth state changed:', event, session?.user?.id);
        setLoading(true); // Set loading true during state change processing

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Update user state if needed on token refresh, profile likely unchanged
          setUser(session.user);
          // Optionally re-fetch profile if it might change based on token claims
          // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
        }
        // Add handling for other events like USER_UPDATED if necessary

        setLoading(false); // Set loading false after processing the event
      });

      // Return cleanup function for the listener
      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    };

    checkSessionAndSetupListener();

    // Cleanup function for the useEffect itself
    return () => {
      isMounted = false;
    };
  }, [fetchUserProfileAndAdminStatus]); // Add dependency

  // --- Auth Actions --- 

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('Login realizado com sucesso:', data.user.id);
      // onAuthStateChange will handle setting user and profile
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      setLoading(false); // Ensure loading is false on error
      return { data: null, error };
    } 
    // setLoading(false) is handled by onAuthStateChange listener
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } });
      if (error) throw error;
      // User might need email confirmation, onAuthStateChange might not fire SIGNED_IN immediately
      // Depending on flow, might need manual user/profile setting or rely on confirmation redirect
      return { data, error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { data: null, error };
    } finally {
      setLoading(false); // Set loading false after signup attempt
    }
  };

  const signOut = async () => {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOut) return { error: null }; 
    
    setIsLoggingOut(true);
    setLoading(true); // Indicate loading during logout
    try {
      console.log("Attempting Supabase sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Log specific Supabase error but don't throw if it's session missing
        if (error.message === 'Auth session missing!') {
            console.warn('Supabase signOut warning:', error.message, '- Session might have already been cleared.');
        } else {
            console.error('Erro no Supabase signOut:', error);
            // Decide if you want to throw other errors or just log them
            // throw error; 
        }
      }
      console.log("Supabase sign out completed (or session was missing).");
      // Manually clear local state regardless of Supabase error (idempotent)
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      // onAuthStateChange will also fire SIGNED_OUT, potentially setting loading false
      return { error: null }; // Return success even if session was already missing
    } catch (error) {
      // Catch unexpected errors during the process
      console.error('Erro inesperado durante o logout:', error);
      // Still clear local state in case of unexpected error
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      return { error }; // Return the caught error
    } finally {
      setIsLoggingOut(false); // Allow logout again
      setLoading(false); // Ensure loading is false after logout attempt
      console.log("SignOut function finished.");
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    // setLoading(true); // Optional: indicate loading during profile update
    try {
      console.log('Dados originais do formulário:', updates);
      const profileData = {
        nome: updates.full_name || updates.nome,
        data_nascimento: updates.birth_date || updates.data_nascimento,
        telefone: updates.phone || updates.telefone,
        objetivo: updates.goal || updates.objetivo,
        altura: updates.height ? parseFloat(updates.height) / 100 : updates.altura,
        peso_inicial: updates.weight ? parseFloat(updates.weight) : updates.peso_inicial,
        condicoes_saude: updates.health_conditions || updates.condicoes_saude
      };
      Object.keys(profileData).forEach(key => (profileData[key] === undefined || profileData[key] === null) && delete profileData[key]);
      console.log('Dados mapeados para o banco:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Perfil atualizado no banco:', data);
      setUserProfile(data); // Update local profile state
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    } finally {
      // setLoading(false); // Optional: stop loading indicator
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

  // Function to get current token (might not be needed if session state is reliable)
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

