import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../supabaseClient'

// Criação do contexto
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(true)

  // Verifica se há usuário autenticado
  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true)
        
        // Verificar sessão atual primeiro
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          setUser(null)
          setUserProfile(null)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          console.log('Sessão encontrada para usuário:', session.user.id)
          setUser(session.user)
          
          // Buscar perfil com timeout reduzido e retry
          await fetchUserProfileWithRetry(session.user.id)
        } else {
          console.log('Nenhuma sessão ativa encontrada')
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        setUser(null)
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listener para mudanças de sessão (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      try {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfileWithRetry(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
          setIsProfileComplete(true)
        }
      } catch (error) {
        console.error('Erro no listener de auth:', error)
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Função para buscar perfil com retry e timeout reduzido
  const fetchUserProfileWithRetry = async (userId, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa ${attempt} de buscar perfil para usuário:`, userId)
        
        const profile = await fetchUserProfileSingle(userId)
        if (profile) {
          return profile
        }
        
        // Se não encontrou perfil, tentar criar um básico
        if (attempt === maxRetries) {
          console.log('Criando perfil básico após todas as tentativas...')
          return await createBasicProfile(userId)
        }
        
      } catch (error) {
        console.error(`Erro na tentativa ${attempt}:`, error)
        
        if (attempt === maxRetries) {
          console.error('Todas as tentativas falharam')
          setUserProfile(null)
          setIsProfileComplete(false)
          return null
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  // Função para buscar perfil (versão simplificada)
  const fetchUserProfileSingle = async (userId) => {
    try {
      // Timeout de 5 segundos para cada tentativa
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca do perfil')), 5000)
      )
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        throw error
      }

      if (data) {
        console.log('Perfil encontrado:', data)
        console.log('Role do usuário:', data.role)
        setUserProfile(data)
        
        // Verificar se o perfil está completo
        const isComplete = data && data.nome && data.nome.trim() !== ''
        setIsProfileComplete(isComplete)
        
        return data
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar perfil:', error.message)
      throw error
    }
  }

  // Função para criar perfil básico
  const createBasicProfile = async (userId) => {
    try {
      console.log('Criando perfil básico para usuário:', userId)
      
      // Buscar dados do usuário autenticado
      const { data: userData } = await supabase.auth.getUser()
      const email = userData?.user?.email || ''
      const name = userData?.user?.user_metadata?.full_name || ''

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            nome: name,
            role: 'cliente',
            plano_ativo: 'inativo'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil básico:', error.message)
        throw error
      }

      console.log('Perfil básico criado:', data)
      console.log('Role definido como:', data.role)
      setUserProfile(data)
      setIsProfileComplete(data.nome && data.nome.trim() !== '')
      
      return data
    } catch (error) {
      console.error('Erro ao criar perfil básico:', error.message)
      setUserProfile(null)
      setIsProfileComplete(false)
      throw error
    }
  }

  // Função para mapear campos do frontend para o backend
  const mapFieldsToDatabase = (profileData) => {
    const fieldMapping = {
      'full_name': 'nome',
      'birth_date': 'data_nascimento',
      'phone': 'telefone',
      'goal': 'objetivo',
      'height': 'altura',
      'weight': 'peso_inicial'
    }

    const mappedData = {}
    
    Object.keys(profileData).forEach(key => {
      const dbField = fieldMapping[key]
      if (dbField) {
        let value = profileData[key]
        
        if ((dbField === 'altura' || dbField === 'peso_inicial') && value) {
          value = parseFloat(value)
        }
        
        if (dbField === 'altura' && value && value > 10) {
          value = value / 100
        }
        
        mappedData[dbField] = value
      }
    })

    console.log('Dados originais do formulário:', profileData)
    console.log('Dados mapeados para o banco:', mappedData)
    
    return mappedData
  }

  // Função para mapear campos do backend para o frontend
  const mapFieldsFromDatabase = (profileData) => {
    if (!profileData) return {}
    
    const fieldMapping = {
      'nome': 'full_name',
      'data_nascimento': 'birth_date',
      'telefone': 'phone',
      'objetivo': 'goal',
      'altura': 'height',
      'peso_inicial': 'weight'
    }

    const mappedData = {}
    
    Object.keys(profileData).forEach(key => {
      const frontendField = fieldMapping[key]
      if (frontendField) {
        let value = profileData[key]
        
        if (key === 'altura' && value && value < 10) {
          value = Math.round(value * 100)
        }
        
        mappedData[frontendField] = value
      } else {
        mappedData[key] = profileData[key]
      }
    })

    return mappedData
  }

  // Função de login
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (error) {
        console.error('Erro ao fazer login:', error.message)
        return { success: false, message: error.message }
      }

      if (!data.user) {
        return { success: false, message: 'Erro ao processar login' }
      }

      console.log('Login realizado com sucesso:', data.user.id)
      
      // Buscar perfil do usuário com retry
      await fetchUserProfileWithRetry(data.user.id)
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Erro no login:', error.message)
      return { success: false, message: 'Erro interno do servidor' }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de cadastro
  const register = async (email, password, fullName) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        console.error('Erro ao fazer cadastro:', error.message)
        return { success: false, message: error.message }
      }

      if (!data.user) {
        return { success: false, message: 'Erro ao processar cadastro' }
      }

      console.log('Cadastro realizado com sucesso:', data.user.id)
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Erro no cadastro:', error.message)
      return { success: false, message: 'Erro interno do servidor' }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erro ao fazer logout:', error.message)
        return { success: false, message: error.message }
      }

      setUser(null)
      setUserProfile(null)
      setIsProfileComplete(true)
      
      return { success: true }
    } catch (error) {
      console.error('Erro no logout:', error.message)
      return { success: false, message: 'Erro interno do servidor' }
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('Atualizando perfil:', profileData)
      
      const mappedData = mapFieldsToDatabase(profileData)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(mappedData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error.message)
        throw error
      }

      console.log('Perfil atualizado no banco:', data)
      setUserProfile(data)
      
      const isComplete = data && data.nome && data.nome.trim() !== ''
      setIsProfileComplete(isComplete)
      
      return { success: true, profile: data }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Função para verificar se o usuário é admin
  const isAdmin = () => {
    console.log('Verificando se é admin. UserProfile:', userProfile)
    console.log('Role atual:', userProfile?.role)
    return userProfile?.role === 'admin'
  }

  // Função para recarregar perfil manualmente
  const refreshProfile = async () => {
    if (user) {
      setIsLoading(true)
      try {
        await fetchUserProfileWithRetry(user.id)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const value = {
    user,
    userProfile,
    isLoading,
    isProfileComplete,
    login,
    register,
    logout,
    updateProfile,
    fetchUserProfile: fetchUserProfileWithRetry,
    isAdmin,
    refreshProfile,
    mapFieldsFromDatabase
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

