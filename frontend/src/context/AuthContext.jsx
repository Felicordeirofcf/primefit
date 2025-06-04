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
  // Loading state: true initially, managed during auth events.
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!user;
  const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);

  // useCallback ensures this function has a stable reference unless dependencies change.
  // Fetches user profile and admin status from Supabase.
  const fetchUserProfileAndAdminStatus = useCallback(async (userId, userEmail) => {
    // Clear profile/admin status if userId or userEmail is missing.
    if (!userId || !userEmail) {
      console.log('fetchUserProfileAndAdminStatus: userId or userEmail missing, clearing state.');
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    console.log(`fetchUserProfileAndAdminStatus: Fetching for userId: ${userId}`);
    try {
      // Fetch profile and check admin status concurrently.
      const [profileResponse, adminResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('is_admin_by_email', { user_email: userEmail })
      ]);

      // Handle profile response.
      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Erro ao buscar perfil:', profileResponse.error);
        // Fallback: Keep previous profile data if available, but ensure basic info exists.
        setUserProfile(prev => ({ 
          ...(prev || {}), // Keep existing data if any
          id: userId, 
          email: userEmail, 
          nome: prev?.nome || userEmail.split('@')[0] || 'Usuário' 
        }));
      } else if (profileResponse.data) {
        console.log('Perfil encontrado:', profileResponse.data);
        setUserProfile(profileResponse.data);
      } else {
         console.log('Perfil não encontrado, usando perfil básico');
         // Set a basic profile if none exists.
         setUserProfile({ id: userId, email: userEmail, nome: userEmail.split('@')[0] || 'Usuário', role: 'cliente' });
      }

      // Handle admin status response.
      if (adminResponse.error) {
        console.error('Erro ao verificar admin:', adminResponse.error);
        setIsAdmin(false);
      } else {
        console.log('Resultado admin por email:', adminResponse.data);
        setIsAdmin(adminResponse.data === true);
      }

    } catch (error) {
      console.error('Erro geral ao buscar perfil/admin:', error);
      // Fallback on general error.
      setUserProfile(prev => ({ 
        ...(prev || {}), 
        id: userId, 
        email: userEmail, 
        nome: prev?.nome || userEmail.split('@')[0] || 'Usuário', 
        role: prev?.role || 'cliente' 
      }));
      setIsAdmin(false);
    }
  }, []); // Empty dependency array: This function reference is stable.

  // Main effect for handling authentication state changes.
  useEffect(() => {
    let isMounted = true;
    console.log("AuthContext useEffect: Mounting and setting up listener.");
    setLoading(true); // Indicate loading state on initial mount and setup.

    // Function to check the initial session state when the component mounts.
    const checkInitialSession = async () => {
      console.log("checkInitialSession: Checking...");
      try {
        // Fetches the current session from Supabase.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Don't update state if the component has unmounted.
        if (!isMounted) {
          console.log("checkInitialSession: Unmounted before session check completed.");
          return;
        }

        if (sessionError) {
          console.error('Erro ao obter sessão inicial:', sessionError);
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        } else if (session?.user) {
          console.log('Sessão inicial encontrada:', session.user.id);
          setUser(session.user);
          // Fetch profile details for the logged-in user.
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
        // Ensure loading is set to false after the initial check completes.
        if (isMounted) {
          console.log("checkInitialSession: Finished, setting loading to false.");
          setLoading(false);
        }
      }
    };

    // Execute the initial session check.
    checkInitialSession();

    // Set up the listener for Supabase auth state changes.
    console.log("Setting up supabase.auth.onAuthStateChange listener.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent state updates if the component is unmounted.
      if (!isMounted) {
        console.log(`onAuthStateChange: Received event ${event} but component unmounted.`);
        return;
      }

      console.log(`onAuthStateChange: Event received - ${event}, User ID: ${session?.user?.id}`);

      // Handle different authentication events.
      switch (event) {
        case 'SIGNED_IN':
          console.log('Handling SIGNED_IN event.');
          // NOTE: Setting loading here might cause UI flicker if components react strongly.
          // Consider if this is necessary or if loading should only be true on initial mount.
          setLoading(true);
          setUser(session.user);
          await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
          setLoading(false);
          break;
        case 'SIGNED_OUT':
          console.log('Handling SIGNED_OUT event.');
          // Clear user state immediately for responsiveness.
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
            // Re-fetching profile on token refresh is usually not needed unless
            // specific claims changed that require profile update.
            // await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
          } else {
            // If token refresh results in no user, treat as sign out.
            console.warn('TOKEN_REFRESHED event with null session, treating as SIGNED_OUT.');
            setUser(null);
            setUserProfile(null);
            setIsAdmin(null);
            setLoading(false);
          }
          break;
        case 'INITIAL_SESSION':
           console.log('Handling INITIAL_SESSION event.');
           // This event might fire alongside SIGNED_IN after initial load.
           // Rely primarily on checkInitialSession for the initial state.
           if (session?.user && !user) { // Act only if we didn't have a user before.
             console.log('Setting user based on INITIAL_SESSION event (user was previously null).');
             // NOTE: Setting loading here might cause UI flicker.
             setLoading(true);
             setUser(session.user);
             await fetchUserProfileAndAdminStatus(session.user.id, session.user.email);
             setLoading(false);
           } else if (!session?.user && user) {
             // If INITIAL_SESSION has no user but we thought we had one, sign out.
             console.warn('INITIAL_SESSION event with null session, signing out.');
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
        // Add handling for other events like PASSWORD_RECOVERY if needed.
        default:
          console.log(`Unhandled auth event: ${event}`);
      }
    });

    // Cleanup function: This runs when the component unmounts.
    return () => {
      console.log("AuthContext useEffect: Unmounting and cleaning up listener.");
      isMounted = false;
      // Unsubscribe from the listener to prevent memory leaks.
      if (subscription) {
        subscription.unsubscribe();
        console.log('Auth listener unsubscribed successfully.');
      } else {
        console.warn('Attempted to unsubscribe, but subscription was null.');
      }
    };
  // Dependency array: fetchUserProfileAndAdminStatus is stable due to useCallback([]).
  // This effect should run only once when the component mounts.
  // Removed 'user' from dependencies to prevent re-subscribing on user state change.
  }, [fetchUserProfileAndAdminStatus]); 

  // --- Auth Actions --- 

  const signIn = async (email, password) => {
    console.log(`signIn: Attempting login for ${email}`);
    // Loading state is handled by onAuthStateChange ('SIGNED_IN').
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('Login request successful.');
      // State updates (user, profile, loading) are handled by the onAuthStateChange listener.
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      // Ensure loading is false on error if not handled by listener.
      setLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    console.log(`signUp: Attempting signup for ${email}`);
    setLoading(true); // Indicate loading during the signup process.
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } });
      if (error) throw error;
      console.log('Signup request successful.');
      // User might need email confirmation. State changes might occur later via onAuthStateChange.
      return { data, error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Prevent multiple simultaneous sign-out attempts.
    if (isLoggingOut) {
      console.log("signOut: Already logging out.");
      return { error: null };
    }
    console.log("signOut: Attempting...");
    setIsLoggingOut(true);
    // Loading state changes are handled by onAuthStateChange ('SIGNED_OUT').
    try {
      const { error } = await supabase.auth.signOut();
      // Ignore 'Auth session missing!' error as it's not critical.
      if (error && error.message !== 'Auth session missing!') {
          console.error('Erro no Supabase signOut:', error);
          // Don't throw, just log. Local state will be cleared anyway.
      }
      console.log("Supabase sign out completed or session was missing.");
      // Manually clear local state immediately for better responsiveness.
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error: null }; // Return null error even if Supabase had a minor issue.
    } catch (error) {
      console.error('Erro inesperado durante o logout:', error);
      // Ensure local state is cleared even on unexpected errors.
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      return { error };
    } finally {
      setIsLoggingOut(false);
      setLoading(false); // Ensure loading is false after sign out attempt.
      console.log("signOut: Function finished.");
    }
  };

  const updateProfile = async (updates) => {
    if (!user) {
      console.error("updateProfile: User not authenticated.");
      throw new Error('Usuário não autenticado');
    }
    // setLoading(true); // Optional: Indicate loading during profile update.
    try {
      console.log('updateProfile: Updating with:', updates);
      // Map frontend field names to Supabase column names if necessary.
      const profileData = {
        nome: updates.full_name || updates.nome,
        data_nascimento: updates.birth_date || updates.data_nascimento,
        telefone: updates.phone || updates.telefone,
        objetivo: updates.goal || updates.objetivo,
        // Ensure height/weight are stored correctly (e.g., height in meters).
        altura: updates.height ? parseFloat(updates.height) / 100 : updates.altura,
        peso_inicial: updates.weight ? parseFloat(updates.weight) : updates.peso_inicial,
        condicoes_saude: updates.health_conditions || updates.condicoes_saude
      };
      // Remove undefined/null/empty fields to avoid overwriting existing data unintentionally.
      Object.keys(profileData).forEach(key => (profileData[key] === undefined || profileData[key] === null || profileData[key] === '') && delete profileData[key]);

      if (Object.keys(profileData).length === 0) {
        console.log("updateProfile: No valid data provided for update.");
        return { data: userProfile, error: null }; // Return current profile if no changes.
      }

      console.log('updateProfile: Mapped data for Supabase:', profileData);

      // Perform the update operation in Supabase.
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select() // Select the updated row.
        .single(); // Expect a single row.

      if (error) throw error;

      console.log('Perfil atualizado no banco:', data);
      // Update the local profile state with the new data.
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    } finally {
      // setLoading(false); // Optional: Stop loading indicator.
    }
  };

  const resetPassword = async (email) => {
    console.log(`resetPassword: Requesting for email: ${email}`);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Optional: Add redirect URL if needed
        // redirectTo: 'http://localhost:5173/update-password',
      });
      if (error) throw error;
      console.log("Password reset email sent successfully.");
      return { error: null };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  // Function to get the current session's access token.
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

  // Memoize the context value to prevent unnecessary re-renders for consumers.
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
  // Ensure all state values and functions provided are listed as dependencies.
  }), [user, userProfile, loading, isAdmin, isAuthenticated, isProfileComplete, 
      signIn, signUp, signOut, updateProfile, resetPassword, getSessionToken]);

  // Provide the authentication context to child components.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context itself if needed for direct consumption.
export { AuthContext };

