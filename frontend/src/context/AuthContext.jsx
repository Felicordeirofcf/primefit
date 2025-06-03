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
        
        // Verificar sessão atual
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
          
          // Buscar perfil com método simplificado
          await fetchUserProfileSimple(session.user.id)
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

    // Listener para mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      try {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfileSimple(session.user.id)
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

  // Função simplificada para buscar perfil (sem RLS complexo)
  const fetchUserProfileSimple = async (userId) => {
    try {
      console.log('Buscando perfil para usuário:', userId)
      
      // Usar timeout mais curto
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca do perfil')), 3000)
      )
      
      // Buscar perfil diretamente
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        console.error('Erro ao buscar perfil:', error.message)
        
        // Se perfil não existe, criar um básico
        if (error.code === 'PGRST116' || error.message.includes('no rows')) {
          console.log('Perfil não encontrado, criando perfil básico...')
          return await createBasicProfileSimple(userId)
        }
        
        throw error
      }

      if (data) {
        console.log('Perfil encontrado:', data)
        console.log('Role do usuário:', data.role)
        setUserProfile(data)
        
        const isComplete = data && data.nome && data.nome.trim() !== ''
        setIsProfileComplete(isComplete)
        
        return data
      } else {
        console.log('Nenhum perfil encontrado, criando perfil básico...')
        return await createBasicProfileSimple(userId)
      }
    } catch (error) {
      console.error('Erro ao processar perfil:', error.message)
      
      // Se der erro de recursão, tentar criar perfil básico
      if (error.message.includes('infinite recursion')) {
        console.log('Erro de recursão detectado, criando perfil básico...')
        return await createBasicProfileSimple(userId)
      }
      
      setUserProfile(null)
      setIsProfileComplete(false)
      return null
    }
  }

  // Função para criar perfil básico (método direto)
  const createBasicProfileSimple = async (userId) => {
    try {
      console.log('Criando perfil básico para usuário:', userId)
      
      const { data: userData } = await supabase.auth.getUser()
      const email = userData?.user?.email || ''
      const name = userData?.user?.user_metadata?.full_name || ''

      // Usar upsert para evitar conflitos
      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: userId,
            email: email,
            nome: name,
            role: 'cliente',
            plano_ativo: 'inativo'
          }
        ], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil básico:', error.message)
        throw error
      }

      console.log('Perfil básico criado/atualizado:', data)
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

  // Função para verificar se é admin (usando função SQL)
  const checkIsAdmin = async () => {
    try {
      if (!user) return false
      
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: user.id })
      
      if (error) {
        console.error('Erro ao verificar admin:', error)
        return false
      }
      
      return data === true
    } catch (error) {
      console.error('Erro ao verificar admin:', error)
      return false
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
      
      // Buscar perfil
      await fetchUserProfileSimple(data.user.id)
      
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

  // Função para verificar se o usuário é admin (local)
  const isAdmin = () => {
    console.log('Verificando se é admin. UserProfile:', userProfile)
    console.log('Role atual:', userProfile?.role)
    return userProfile?.role === 'admin'
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
    fetchUserProfile: fetchUserProfileSimple,
    isAdmin,
    checkIsAdmin,
    mapFieldsToDatabase
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

