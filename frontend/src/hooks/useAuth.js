import { useAuth as useAuthContext } from '../context/AuthContext'

/**
 * Hook personalizado que fornece uma interface compatível com o código existente
 * Mapeia as funções do AuthContext para nomes mais intuitivos
 */
export const useAuth = () => {
  const context = useAuthContext()

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  const {
    signUp,
    signIn,
    signOut,
    user,
    userProfile,
    loading,
    isAdmin,
    isAuthenticated,
    isProfileComplete,
    updateProfile,
    resetPassword,
    getSessionToken
  } = context

  // Função register compatível com o código existente
  const register = async (fullName, email, password) => {
    try {
      const result = await signUp(email, password, { full_name: fullName })
      
      return {
        success: result.data && !result.error,
        data: result.data,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Erro ao registrar usuário'
      }
    }
  }

  // Função login compatível com o código existente
  const login = async (email, password) => {
    try {
      const result = await signIn(email, password)
      
      return {
        success: result.data && !result.error,
        data: result.data,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Erro ao fazer login'
      }
    }
  }

  // Função logout compatível com o código existente
  const logout = async () => {
    try {
      const result = await signOut()
      
      return {
        success: !result.error,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao fazer logout'
      }
    }
  }

  return {
    // Funções originais do AuthContext
    signUp,
    signIn,
    signOut,
    
    // Funções compatíveis com código existente
    register,
    login,
    logout,
    
    // Estados e dados do usuário
    user,
    userProfile,
    loading,
    isAdmin,
    isAuthenticated,
    isProfileComplete,
    
    // Outras funções úteis
    updateProfile,
    resetPassword,
    getSessionToken
  }
}

