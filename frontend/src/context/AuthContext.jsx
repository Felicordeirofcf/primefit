import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'  // ✅ Arquivo existe
;

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar se é admin por email
  const checkAdminByEmail = async (email) => {
    try {
      console.log('Verificando admin por email:', email);
      
      const { data, error } = await supabase
        .rpc('is_admin_by_email', { user_email: email });
      
      if (error) {
        console.error('Erro ao verificar admin por email:', error);
        return false;
      }
      
      console.log('Resultado admin por email:', data);
      return data === true;
    } catch (error) {
      console.error('Erro na verificação de admin:', error);
      return false;
    }
  };

  // Função para buscar perfil por email
  const fetchProfileByEmail = async (email) => {
    try {
      console.log('Buscando perfil por email:', email);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil por email:', error);
        return null;
      }
      
      console.log('Perfil encontrado por email:', data);
      return data;
    } catch (error) {
      console.error('Erro na busca do perfil:', error);
      return null;
    }
  };

  // Função para verificar e carregar dados do usuário
  const loadUserData = async (authUser) => {
    if (!authUser?.email) {
      console.log('Usuário sem email, limpando dados');
      setUserProfile(null);
      return;
    }

    try {
      console.log('Carregando dados para usuário:', authUser.email);
      
      // Buscar perfil por email
      const profile = await fetchProfileByEmail(authUser.email);
      
      if (profile) {
        // Verificar se é admin por email
        const isAdmin = await checkAdminByEmail(authUser.email);
        
        // Adicionar informação de admin ao perfil
        const profileWithAdmin = {
          ...profile,
          isAdmin: isAdmin,
          role: profile.role || 'cliente'
        };
        
        console.log('Perfil carregado com sucesso:', profileWithAdmin);
        setUserProfile(profileWithAdmin);
      } else {
        console.log('Perfil não encontrado, criando perfil básico');
        
        // Criar perfil básico se não existir
        const basicProfile = {
          id: authUser.id,
          email: authUser.email,
          nome: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          role: 'cliente',
          isAdmin: false
        };
        
        setUserProfile(basicProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUserProfile(null);
    }
  };

  // Monitorar mudanças de autenticação
  useEffect(() => {
    console.log('Inicializando AuthContext...');
    
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setUser(null);
          setUserProfile(null);
        } else if (session?.user) {
          console.log('Sessão encontrada:', session.user.email);
          setUser(session.user);
          await loadUserData(session.user);
        } else {
          console.log('Nenhuma sessão ativa');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Erro na verificação de sessão:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Função de login
  const signIn = async (email, password) => {
    try {
      console.log('Tentando fazer login:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      console.log('Login realizado com sucesso:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('Erro no processo de login:', error);
      return { data: null, error };
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      
      setUser(null);
      setUserProfile(null);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no processo de logout:', error);
      throw error;
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (updates) => {
    try {
      if (!user?.email) {
        throw new Error('Usuário não está logado');
      }

      console.log('Atualizando perfil:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('email', user.email)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }

      console.log('Perfil atualizado com sucesso:', data);
      
      // Recarregar dados do usuário
      await loadUserData(user);
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro no processo de atualização:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    updateProfile,
    isAdmin: userProfile?.isAdmin || false,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

