// src/context/AuthContext.jsx

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
        
        // Timeout de segurança para evitar carregamento infinito
        const timeoutId = setTimeout(() => {
          console.warn('Timeout na verificação de usuário')
          setIsLoading(false)
        }, 10000) // 10 segundos
        
        const { data, error } = await supabase.auth.getUser()
        
        clearTimeout(timeoutId) // Limpar timeout se a operação completar
        
        if (data?.user && !error) {
          setUser(data.user)
          // Buscar dados do perfil do usuário
          await fetchUserProfile(data.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
          setIsProfileComplete(true)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        setUser(null)
        setUserProfile(null)
        setIsProfileComplete(true)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listener para mudanças de sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      try {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
          setIsProfileComplete(true)
        }
      } catch (error) {
        console.error('Erro no listener de auth:', error)
      } finally {
        // Sempre definir loading como false após mudança de estado
        setIsLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId) => {
    try {
      console.log('Buscando perfil para usuário:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle() ao invés de single() para evitar erro quando não há dados

      if (error) {
        console.error('Erro ao buscar perfil:', error.message)
        
        // Se o perfil não existe, criar um básico
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando perfil básico...')
          const newProfile = await createBasicProfile(userId)
          return newProfile
        }
        
        setUserProfile(null)
        setIsProfileComplete(false)
        return null
      }

      if (data) {
        console.log('Perfil encontrado:', data)
        setUserProfile(data)
        
        // Verificar se o perfil está completo
        const isComplete = data && data.nome && data.nome.trim() !== ''
        setIsProfileComplete(isComplete)
        
        return data
      } else {
        console.log('Nenhum perfil encontrado, criando perfil básico...')
        const newProfile = await createBasicProfile(userId)
        return newProfile
      }
    } catch (error) {
      console.error('Erro ao processar perfil:', error.message)
      setUserProfile(null)
      setIsProfileComplete(false)
      return null
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
      // 'health_conditions' não existe na tabela, removido por enquanto
    }

    const mappedData = {}
    
    Object.keys(profileData).forEach(key => {
      const dbField = fieldMapping[key]
      if (dbField) { // Só mapear campos que existem na tabela
        let value = profileData[key]
        
        // Converter valores numéricos se necessário
        if ((dbField === 'altura' || dbField === 'peso_inicial') && value) {
          value = parseFloat(value)
        }
        
        // Converter altura de cm para metros se necessário
        if (dbField === 'altura' && value > 10) {
          value = value / 100 // Converter de cm para metros
        }
        
        mappedData[dbField] = value
      }
    })
    
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
        
        // Converter altura de metros para cm para exibição
        if (key === 'altura' && value) {
          value = Math.round(value * 100) // Converter de metros para cm
        }
        
        mappedData[frontendField] = value
      }
    })
    
    return mappedData
  }
  const createBasicProfile = async (userId) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const email = userData?.user?.email || ''
      const name = userData?.user?.user_metadata?.name || userData?.user?.user_metadata?.full_name || ''

      console.log('Criando perfil básico para:', { userId, email, name })

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            nome: name,
            plano_ativo: 'inativo'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil básico:', error.message)
        setUserProfile(null)
        setIsProfileComplete(false)
        return
      }

      console.log('Perfil básico criado:', data)
      setUserProfile(data)
      setIsProfileComplete(data.nome && data.nome.trim() !== '')
      
      return data
    } catch (error) {
      console.error('Erro ao criar perfil básico:', error.message)
      setUserProfile(null)
      setIsProfileComplete(false)
    }
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
      setUser(data.user)
      
      // Buscar perfil do usuário após login
      const profile = await fetchUserProfile(data.user.id)
      
      // Verificar se o perfil está completo
      const profileComplete = profile && profile.nome && profile.nome.trim() !== ''
      
      return { 
        success: true, 
        profileComplete: profileComplete 
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error.message)
      return { success: false, message: 'Erro ao processar login. Tente novamente.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de cadastro
  const register = async (name, email, password) => {
    try {
      setIsLoading(true)
      
      console.log('Iniciando cadastro:', { name, email })

      // 1. Registrar usuário no Auth do Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name
          }
        }
      })

      if (error) {
        console.error('Erro ao registrar:', error.message)
        return { success: false, message: error.message }
      }

      // Verificar se o usuário foi criado corretamente
      if (!data.user || !data.user.id) {
        console.error('Erro: Usuário não foi criado corretamente')
        return { success: false, message: 'Erro ao criar usuário. Tente novamente.' }
      }

      console.log('Usuário criado no Auth:', data.user.id)

      // 2. O perfil será criado automaticamente pelo trigger ou pela função fetchUserProfile
      // Não precisamos criar manualmente aqui

      return { 
        success: true,
        message: data.user.email_confirmed_at ? 
          'Cadastro realizado com sucesso!' : 
          'Cadastro realizado! Verifique seu email para confirmar a conta.'
      }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error)
      return { success: false, message: 'Erro ao processar cadastro. Tente novamente.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar o perfil do usuário
  const updateProfile = async (profileData) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' }

    try {
      setIsLoading(true)
      
      console.log('Dados originais do formulário:', profileData)
      
      // Mapear campos do frontend para o banco de dados
      const mappedData = mapFieldsToDatabase(profileData)
      
      console.log('Dados mapeados para o banco:', mappedData)

      // Atualizar dados na tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...mappedData,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error.message)
        return { success: false, message: error.message }
      }

      console.log('Perfil atualizado no banco:', data)
      
      // Atualizar o estado local
      setUserProfile(data)
      setIsProfileComplete(data.nome && data.nome.trim() !== '')
      
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao processar atualização:', error)
      return { success: false, message: 'Erro ao processar atualização' }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setIsProfileComplete(true)
      
      // Limpar tokens do localStorage
      localStorage.removeItem('access_token')
      sessionStorage.removeItem('access_token')
      
      console.log('Logout realizado com sucesso')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    fetchUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

