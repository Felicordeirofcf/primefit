import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error)
        } else if (session?.user) {
          console.log('Sessão inicial encontrada:', session.user.id)
          setUser(session.user)
          await fetchUserProfile(session.user.id, session.user.email)
        }
      } catch (error) {
        console.error('Erro na verificação de sessão inicial:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id, session.user.email)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserProfile(null)
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId, userEmail) => {
    try {
      console.log('Buscando perfil para usuário:', userId)
      
      // Timeout de 3 segundos para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca do perfil')), 3000)
      )
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise])
      
      if (error) {
        if (error.message === 'Timeout na busca do perfil') {
          console.warn('Timeout na busca do perfil - usando dados básicos')
          setUserProfile({ 
            id: userId, 
            email: userEmail, 
            nome: userEmail?.split('@')[0] || 'Usuário',
            role: 'cliente' 
          })
        } else {
          console.error('Erro ao buscar perfil:', error)
          // Criar perfil básico se não existir
          setUserProfile({ 
            id: userId, 
            email: userEmail, 
            nome: userEmail?.split('@')[0] || 'Usuário',
            role: 'cliente' 
          })
        }
      } else {
        console.log('Perfil encontrado:', profile)
        setUserProfile(profile)
      }
      
      // Verificar se é admin usando a função do Supabase
      await checkAdminStatus(userEmail)
      
    } catch (error) {
      console.error('Erro na busca do perfil:', error)
      setUserProfile({ 
        id: userId, 
        email: userEmail, 
        nome: userEmail?.split('@')[0] || 'Usuário',
        role: 'cliente' 
      })
    }
  }

  const checkAdminStatus = async (userEmail) => {
    try {
      if (!userEmail) {
        setIsAdmin(false)
        return
      }
      
      console.log('Verificando admin por email:', userEmail)
      
      // Usar a função is_admin_by_email que já está funcionando
      const { data, error } = await supabase.rpc('is_admin_by_email', {
        user_email: userEmail
      })
      
      if (error) {
        console.error('Erro ao verificar admin:', error)
        setIsAdmin(false)
      } else {
        console.log('Resultado admin por email:', data)
        setIsAdmin(data === true)
      }
    } catch (error) {
      console.error('Erro na verificação de admin:', error)
      setIsAdmin(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      console.log('Login realizado com sucesso:', data.user.id)
      return { data, error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
      
      return { error: null }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('Dados originais do formulário:', updates)
      
      // Mapear campos do formulário para campos do banco
      const profileData = {
        nome: updates.full_name || updates.nome,
        data_nascimento: updates.birth_date || updates.data_nascimento,
        telefone: updates.phone || updates.telefone,
        objetivo: updates.goal || updates.objetivo,
        altura: updates.height ? parseFloat(updates.height) / 100 : updates.altura, // Converter cm para metros
        peso_inicial: updates.weight ? parseFloat(updates.weight) : updates.peso_inicial,
        condicoes_saude: updates.health_conditions || updates.condicoes_saude
      }
      
      // Remover campos undefined
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined) {
          delete profileData[key]
        }
      })
      
      console.log('Dados mapeados para o banco:', profileData)
      
      // Usar upsert para criar ou atualizar
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...profileData
        }, {
          onConflict: 'id'
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      console.log('Perfil atualizado no banco:', data)
      setUserProfile(data)
      
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        throw error
      }
      
      return { error: null }
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      return { error }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Exportar o AuthContext para compatibilidade com useAuth.js
export { AuthContext }

