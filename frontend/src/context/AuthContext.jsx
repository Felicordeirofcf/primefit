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

  // Função para buscar o perfil do usuário e verificar se é admin
  const fetchUserProfileAndAdminStatus = useCallback(async (userId, userEmail) => {
    if (!userId || !userEmail) {
      console.log('fetchUserProfileAndAdminStatus: userId ou userEmail ausente, limpando estado.');
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    console.log(`fetchUserProfileAndAdminStatus: Buscando para userId: ${userId}`);
    try {
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await profilesAPI.getMyProfile();
      
      // Verificar se o email é do admin (fallback)
      const isAdminByEmail = userEmail === 'felpcordeirofcf@gmail.com';

      // Tratar resposta do perfil
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setUserProfile(prev => ({
          ...(prev || {}),
          id: userId,
          email: userEmail,
          nome: prev?.nome || userEmail.split('@')[0] || 'Usuário',
          role: isAdminByEmail ? 'admin' : 'cliente'
        }));
      } else if (profileData) {
        console.log('Perfil encontrado:', profileData);
        // Se o email for do admin, garantir que o role seja admin
        if (isAdminByEmail && profileData.role !== 'admin') {
          profileData.role = 'admin';
        }
        setUserProfile(profileData);
      } else {
         console.log('Perfil não encontrado, usando perfil básico');
         setUserProfile({
           id: userId,
           email: userEmail,
           nome: userEmail.split('@')[0] || 'Usuário',
           role: isAdminByEmail ? 'admin' : 'cliente'
         });
      }

      // Definir status de admin
      setIsAdmin(profileData?.role === 'admin' || isAdminByEmail);

      console.log('Verificando status admin para:', userEmail);
      console.log('Resultado verificação admin:', isAdminByEmail || (profileData?.role === 'admin'));

    } catch (error) {
      console.error('Erro geral ao buscar perfil/admin:', error);
      const isAdminByEmail = userEmail === 'felpcordeirofcf@gmail.com';
      setUserProfile(prev => ({
        ...(prev || {}),
        id: userId,
        email: userEmail,
        nome: prev?.nome || userEmail.split('@')[0] || 'Usuário',
        role: isAdminByEmail ? 'admin' : (prev?.role || 'cliente')
      }));
      setIsAdmin(isAdminByEmail); // Fallback para verificação por email
    }
  }, []);

  // Efeito para verificar a sessão inicial e configurar o listener de mudanças de autenticação
  useEffect(() => {
    let isMounted = true;
    console.log("AuthContext useEffect: Montando. Configurando verificação inicial.");
    setLoading(true);

    // Verificar sessão inicial
    const checkInitialSession = async () => {
      try {
        // Verificar se há um token no localStorage
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          console.log('Token e dados do usuário encontrados no localStorage');
          
          // Decodificar o token JWT para obter o payload
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          // Verificar se o token expirou
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTime) {
            console.log('Token expirado, limpando dados');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
          } else {
            // Token válido, definir usuário
            const parsedUserData = JSON.parse(userData);
            setUser({
              id: payload.user_id,
              email: payload.sub,
              role: payload.role
            });
            setUserProfile(parsedUserData);
            setIsAdmin(payload.role === 'admin' || payload.sub === 'felpcordeirofcf@gmail.com');
            
            // Atualizar perfil em segundo plano
            fetchUserProfileAndAdminStatus(payload.user_id, payload.sub);
          }
        } else {
          console.log('Nenhum token ou dados do usuário encontrados no localStorage');
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão inicial:', error);
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

    // Função de limpeza
    return () => {
      console.log("AuthContext useEffect: Desmontando.");
      isMounted = false;
    };
  }, [fetchUserProfileAndAdminStatus]);

  // --- Ações de Autenticação --- 

  const signIn = async (email, password) => {
    console.log(`signIn: Tentando login para ${email}`);
    setLoading(true);
    try {
      const { data, error } = await authAPI.login(email, password);
      if (error) throw new Error(error);
      
      // Decodificar o token JWT para obter o payload
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Definir usuário
      const userData = {
        id: payload.user_id,
        email: payload.sub,
        role: payload.role
      };
      
      setUser(userData);
      
      // Buscar perfil do usuário
      await fetchUserProfileAndAdminStatus(userData.id, userData.email);
      
      console.log('Login bem-sucedido');
      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    console.log(`signUp: Tentando cadastro para ${email}`);
    setLoading(true);
    try {
      const { data, error } = await authAPI.register(userData); // Passa o objeto userData completo
      if (error) throw new Error(error);
      console.log('Cadastro bem-sucedido');
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
      console.log("signOut: Já está fazendo logout.");
      return { error: null };
    }
    console.log("signOut: Tentando...");
    setIsLoggingOut(true);
    setLoading(true);
    try {
      const { error } = await authAPI.logout();
      if (error) throw new Error(error);
      
      // Limpar estado
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      
      console.log("Logout bem-sucedido");
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado durante o logout:', error);
      
      // Limpar estado mesmo em caso de erro
      setUser(null);
      setUserProfile(null);
      setIsAdmin(null);
      
      return { error };
    } finally {
      setIsLoggingOut(false);
      setLoading(false);
      console.log("signOut: Função finalizada.");
    }
  };

  const updateProfile = async (updates) => {
    if (!user) {
      console.error("updateProfile: Usuário não autenticado.");
      throw new Error('Usuário não autenticado');
    }
    setLoading(true);
    try {
      console.log('updateProfile: Atualizando com:', updates);
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
        console.log("updateProfile: Nenhum dado válido fornecido para atualização.");
        return { data: userProfile, error: null };
      }

      console.log('updateProfile: Dados mapeados para API:', profileData);
      const { data, error } = await profilesAPI.updateProfile(profileData);
      
      if (error) throw new Error(error);

      console.log('Perfil atualizado no banco:', data);
      setUserProfile(data);
      
      // Atualizar dados do usuário no localStorage
      localStorage.setItem('user_data', JSON.stringify(data));
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    console.log(`resetPassword: Solicitando para email: ${email}`);
    try {
      const { error } = await authAPI.resetPassword(email);
      if (error) throw new Error(error);
      console.log("Email de redefinição de senha enviado com sucesso.");
      return { error: null };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  const getSessionToken = async () => {
    console.log("getSessionToken: Tentando obter token de sessão.");
    try {
      const token = localStorage.getItem('auth_token');
      console.log(`getSessionToken: Token ${token ? 'encontrado' : 'não encontrado'}.`);
      return token;
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  };

  // Memorizar o valor do contexto para evitar re-renderizações desnecessárias
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


