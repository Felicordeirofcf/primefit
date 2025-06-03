import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

// Criação do contexto de autenticação
export const AuthContext = createContext()

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)
  
  // Verifica se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }
      
      try {
        // Configura o token no cabeçalho da requisição
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        
        // Busca os dados do usuário
        const response = await axios.get(`${API_URL}/auth/me`, config)
        setUser(response.data)
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        // Remove o token inválido
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    verifyToken()
  }, [token])
  
  // Função para login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/token`, {
        username: email,
        password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      const { access_token, user_id, user_role } = response.data
      
      // Salva o token no localStorage
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Busca os dados completos do usuário
      const userResponse = await axios.get(`${API_URL}/users/${user_id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      
      setUser(userResponse.data)
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return {
        success: false,
        message: error.response?.data?.detail || 'Erro ao fazer login'
      }
    }
  }
  
  // Função para registro
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      })
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao registrar:', error)
      return {
        success: false,
        message: error.response?.data?.detail || 'Erro ao registrar'
      }
    }
  }
  
  // Função para logout
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }
  
  // Valores expostos pelo contexto
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
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
