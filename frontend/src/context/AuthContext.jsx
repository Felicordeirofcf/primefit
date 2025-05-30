// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient'; // Certifique-se que este caminho está correto e o cliente está configurado

// Criação do contexto
export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para a carga inicial
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Assume completo até que se prove o contrário

  // Função para buscar o perfil do usuário, otimizada com useCallback
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setUserProfile(null);
      setIsProfileComplete(true); // Sem usuário, não há perfil a ser incompleto
      return null;
    }

    // setIsLoading(true); // Movido para ser gerenciado pelas funções que chamam fetchUserProfile
    try {
      const { data, error } = await supabase
        .from('users') // Certifique-se que o nome da tabela é 'users'
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Código específico para "row not found"
          console.warn('Perfil não encontrado para o usuário:', userId);
          setUserProfile(null);
          setIsProfileComplete(false); // Perfil não encontrado é considerado incompleto
        } else {
          console.error('Erro ao buscar perfil do usuário:', error.message);
          setUserProfile(null);
          setIsProfileComplete(false); // Outros erros também resultam em perfil incompleto
        }
        return null;
      }

      setUserProfile(data);
      const isComplete = data && data.full_name && data.full_name.trim() !== '';
      setIsProfileComplete(isComplete);
      return data;
    } catch (processError) {
      console.error('Erro inesperado ao processar busca de perfil:', processError.message);
      setUserProfile(null);
      setIsProfileComplete(false);
      return null;
    } finally {
      // setIsLoading(false); // Movido para ser gerenciado pelas funções que chamam fetchUserProfile
    }
  }, []); // useCallback sem dependências, pois supabase é estável e não usa props/state daqui.

  // Efeito para buscar o usuário inicial e configurar o listener de autenticação
  useEffect(() => {
    let mounted = true; // Para evitar atualizações de estado em componente desmontado
    setIsLoading(true);

    const getInitialSession = async () => {
      // Tenta pegar a sessão ativa, é mais direto que getUser para a carga inicial
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError && mounted) {
        console.error("Erro ao buscar sessão inicial:", sessionError.message);
      }

      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsProfileComplete(true); // Sem sessão, perfil é considerado "completo" (ou irrelevante)
        }
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setIsLoading(true); // Indica carregamento durante a transição de estado
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
            setIsProfileComplete(true);
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserProfile]); // Adiciona fetchUserProfile como dependência do useEffect

  // Função de login
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Erro ao fazer login:', error.message);
        return { success: false, message: error.message, profileComplete: false };
      }

      // onAuthStateChange irá lidar com setUser e fetchUserProfile.
      // No entanto, para um feedback mais imediato da UI sobre `profileComplete`:
      let profileIsComplete = false;
      if (data.user) {
         // Não precisamos chamar setUser(data.user) aqui, pois onAuthStateChange fará isso.
         // Mas podemos chamar fetchUserProfile para ter o status de `profileComplete` mais rápido.
        const profile = await fetchUserProfile(data.user.id);
        profileIsComplete = profile && profile.full_name && profile.full_name.trim() !== '';
      }
      // O estado `isProfileComplete` será atualizado por `fetchUserProfile` e `onAuthStateChange`
      return { success: true, profileComplete: profileIsComplete };
    } catch (error) {
      console.error('Erro inesperado no login:', error.message);
      return { success: false, message: 'Erro ao processar login. Tente novamente.', profileComplete: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Função de cadastro
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name } // Armazena 'name' em user_metadata
        }
      });

      if (authError) {
        console.error('Erro ao registrar no Supabase Auth:', authError.message);
        return { success: false, message: authError.message };
      }

      if (!authData.user || !authData.user.id) {
        console.error('Erro: Usuário não foi criado corretamente no Auth.');
        return { success: false, message: 'Falha ao criar usuário. Tente novamente.' };
      }

      // Inserir dados na tabela 'users' (perfil)
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            id: authData.user.id, 
            email: email,
            full_name: name || '', // Garante que full_name tenha um valor
            role: 'client', // Define uma role padrão
            // profile_completed: false, // Pode ser definido aqui se tiver essa coluna no BD
          }
        ]);

      if (insertError) {
        console.error('Erro ao inserir perfil na tabela users:', insertError.message);
        console.warn('Usuário criado no Auth, mas falha ao criar perfil na tabela "users".');
        // O onAuthStateChange irá definir o usuário.
        // fetchUserProfile (chamado por onAuthStateChange) irá detectar que o perfil não existe
        // e definirá isProfileComplete como false.
        return { success: true, profileCreated: false, message: 'Usuário registrado, mas falha ao criar perfil local.' };
      }
      
      // onAuthStateChange irá lidar com a atualização do estado do usuário e do perfil.
      return { success: true, profileCreated: true };
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      return { success: false, message: 'Erro ao processar cadastro. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar o perfil do usuário
  const updateProfile = async (profileData) => {
    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' };
    }
    setIsLoading(true);
    try {
      const updatePayload = { ...profileData };
      // Se o `full_name` está sendo atualizado para um valor não vazio,
      // pode-se assumir que o perfil está se tornando completo ou sendo mantido completo.
      // A lógica exata de `profile_completed` no banco depende do seu modelo de dados.
      if (profileData.full_name && profileData.full_name.trim() !== '') {
         // Se você tem uma coluna `profile_completed` no banco:
         // updatePayload.profile_completed = true;
      }


      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error.message);
        return { success: false, message: error.message };
      }

      await fetchUserProfile(user.id); // Re-buscar perfil para atualizar o estado local
      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao processar atualização de perfil:', error);
      return { success: false, message: 'Erro ao processar atualização. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setIsLoading(true);
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erro ao fazer logout:', error.message);
            // Mesmo com erro, o estado local será limpo pelo onAuthStateChange
        }
        // O onAuthStateChange irá cuidar de limpar setUser, setUserProfile e setIsProfileComplete.
        // Limpar manualmente aqui pode ser redundante mas não prejudicial.
        // setUser(null);
        // setUserProfile(null);
        // setIsProfileComplete(true);
    } catch (error) {
        console.error('Erro inesperado no logout:', error.message);
    } finally {
        setIsLoading(false); // Certifica que o loading é desativado
    }
  };

  // Valores do contexto
  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading,
    isProfileComplete,
    login,
    register,
    logout,
    updateProfile,
    fetchUserProfile // Expor fetchUserProfile pode ser útil
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};