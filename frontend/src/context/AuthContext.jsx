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
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        // Buscar dados do perfil do usuário
        await fetchUserProfile(data.user.id)
      }
      setIsLoading(false)
    }

    getUser()

    // Listener para mudanças de sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setIsProfileComplete(true)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error.message)
        setUserProfile(null)
        setIsProfileComplete(false)
        return
      }

      setUserProfile(data)
      
      // Verificar se o perfil está completo
      const isComplete = data && data.full_name && data.full_name.trim() !== ''
      setIsProfileComplete(isComplete)
      
      return data
    } catch (error) {
      console.error('Erro ao processar perfil:', error.message)
      setUserProfile(null)
      setIsProfileComplete(false)
    }
  }

  // Função de login
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('Erro ao fazer login:', error.message)
        return { success: false, message: error.message }
      }

      setUser(data.user)
      
      // Buscar perfil do usuário após login
      const profile = await fetchUserProfile(data.user.id)
      
      // Verificar se o perfil está completo
      const profileComplete = profile && profile.full_name && profile.full_name.trim() !== ''
      
      return { 
        success: true, 
        profileComplete: profileComplete 
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error.message)
      return { success: false, message: 'Erro ao processar login. Tente novamente.' }
    }
  }

  // Função de cadastro
  const register = async (name, email, password) => {
    try {
      // 1. Registrar usuário no Auth do Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name // será armazenado no user_metadata
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

      // 2. Inserir dados na tabela public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            id: data.user.id, 
            email: email,
            full_name: name || '',
            role: 'client',
          }
        ])

      if (insertError) {
        console.error('Erro ao inserir na tabela users:', insertError.message)
        // Mesmo com erro na inserção na tabela users, o usuário foi criado no Auth
        // Então retornamos sucesso, mas logamos o erro
        console.warn('Usuário criado no Auth, mas não na tabela users')
      }

      return { success: true }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error)
      return { success: false, message: 'Erro ao processar cadastro. Tente novamente.' }
    }
  }

  // Função para atualizar o perfil do usuário
  const updateProfile = async (profileData) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' }

    try {
      // Atualizar dados na tabela users
      const { error } = await supabase
        .from('users')
        .update({ 
          ...profileData,
          profile_completed: true 
        })
        .eq('id', user.id)

      if (error) {
        console.error('Erro ao atualizar perfil:', error.message)
        return { success: false, message: error.message }
      }

      // Atualizar o estado local
      await fetchUserProfile(user.id)
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao processar atualização:', error)
      return { success: false, message: 'Erro ao processar atualização' }
    }
  }

  // Função de logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setIsProfileComplete(true)
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
export const useAuth = () => useContext(AuthContext)
