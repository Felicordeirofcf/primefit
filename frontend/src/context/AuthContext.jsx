// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../supabaseClient'

// Criação do contexto
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se há usuário autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
      setIsLoading(false)
    }

    getUser()

    // Listener para mudanças de sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Função de login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Erro ao fazer login:', error.message)
      return { success: false, message: error.message }
    }

    setUser(data.user)
    return { success: true }
  }

  // Função de cadastro
  const register = async (name, email, password) => {
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

    return { success: true }
  }

  // Função de logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Valores do contexto
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook customizado para usar o contexto
export const useAuth = () => useContext(AuthContext)
