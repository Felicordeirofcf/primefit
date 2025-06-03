import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../supabaseClient'
import { EvolutionChart, ComparisonChart, DistributionChart, StatCard } from '../../components/charts/ChartComponents'

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AdminDashboard = () => {
  const { user, userProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckLoading, setAdminCheckLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [adminData, setAdminData] = useState({
    overview: null,
    users: [],
    recentActivity: [],
    analytics: null
  })
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Verificar se o usuário é admin usando a função do Supabase
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setAdminCheckLoading(false)
        return
      }
      
      try {
        console.log('Verificando status admin para:', user.email)
        
        // Usar a função is_admin_by_email que já está funcionando
        const { data, error } = await supabase.rpc('is_admin_by_email', {
          user_email: user.email
        })
        
        if (error) {
          console.error('Erro ao verificar admin:', error)
          setIsAdmin(false)
        } else {
          console.log('Resultado verificação admin:', data)
          setIsAdmin(data === true)
        }
      } catch (error) {
        console.error('Erro na verificação de admin:', error)
        setIsAdmin(false)
      } finally {
        setAdminCheckLoading(false)
      }
    }
    
    checkAdminStatus()
  }, [user?.email])
  
  // Mostrar loading enquanto verifica admin
  if (adminCheckLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Verificando permissões...</span>
      </div>
    )
  }
  
  // Verificar se o usuário é admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-500">Você não tem permissão para acessar o painel administrativo.</p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Email: {user?.email}</p>
            <p>Status Admin: {isAdmin ? 'Sim' : 'Não'}</p>
          </div>
        </div>
      </div>
    )
  }
  
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview()
      fetchRecentActivity()
      fetchAnalytics()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, usersPagination.page, searchTerm])
  
  const getAuthToken = async () => {
    try {
      // Tentar obter token da sessão do Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erro ao obter sessão:', error)
        return null
      }
      
      if (session?.access_token) {
        return session.access_token
      }
      
      // Fallback para localStorage/sessionStorage
      return localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    } catch (error) {
      console.error('Erro ao obter token:', error)
      return null
    }
  }
  
  const fetchOverview = async () => {
    try {
      const token = await getAuthToken()
      
      if (!token) {
        console.warn('Token não encontrado - usando dados mock')
        setAdminData(prev => ({ 
          ...prev, 
          overview: {
            total_users: 156,
            active_users: 89,
            user_growth_rate: 12.5,
            active_subscriptions: 67,
            total_revenue: 13450.00
          }
        }))
        return
      }
      
      const response = await fetch(`${API_URL}/admin/stats/overview`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(prev => ({ ...prev, overview: data }))
      } else {
        console.log('API não disponível, usando dados mock')
        setAdminData(prev => ({ 
          ...prev, 
          overview: {
            total_users: 156,
            active_users: 89,
            user_growth_rate: 12.5,
            active_subscriptions: 67,
            total_revenue: 13450.00
          }
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar overview:', error)
      // Usar dados mock em caso de erro
      setAdminData(prev => ({ 
        ...prev, 
        overview: {
          total_users: 156,
          active_users: 89,
          user_growth_rate: 12.5,
          active_subscriptions: 67,
          total_revenue: 13450.00
        }
      }))
    }
  }
  
  const fetchUsers = async () => {
    try {
      const token = await getAuthToken()
      
      if (!token) {
        console.warn('Token não encontrado - usando dados mock')
        setAdminData(prev => ({ 
          ...prev, 
          users: [
            {
              id: '1',
              nome: 'Felipe Cordeiro Ferreira',
              email: 'felpcordeirofcf@gmail.com',
              role: 'admin',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              nome: 'Cliente Exemplo',
              email: 'cliente@exemplo.com',
              role: 'cliente',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }))
        setUsersPagination({
          page: 1,
          limit: 20,
          total: 2,
          pages: 1
        })
        setIsLoading(false)
        return
      }
      
      const params = new URLSearchParams({
        page: usersPagination.page.toString(),
        limit: usersPagination.limit.toString()
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(prev => ({ ...prev, users: data.users }))
        setUsersPagination(data.pagination)
      } else {
        console.log('API não disponível, usando dados mock')
        setAdminData(prev => ({ 
          ...prev, 
          users: [
            {
              id: '1',
              nome: 'Felipe Cordeiro Ferreira',
              email: 'felpcordeirofcf@gmail.com',
              role: 'admin',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              nome: 'Cliente Exemplo',
              email: 'cliente@exemplo.com',
              role: 'cliente',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setAdminData(prev => ({ 
        ...prev, 
        users: [
          {
            id: '1',
            nome: 'Felipe Cordeiro Ferreira',
            email: 'felpcordeirofcf@gmail.com',
            role: 'admin',
            created_at: new Date().toISOString()
          }
        ]
      }))
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchRecentActivity = async () => {
    try {
      const token = await getAuthToken()
      
      if (!token) {
        setAdminData(prev => ({ 
          ...prev, 
          recentActivity: [
            {
              type: 'new_user',
              title: 'Novo usuário cadastrado',
              description: 'Felipe Cordeiro Ferreira se cadastrou na plataforma',
              date: new Date().toISOString()
            },
            {
              type: 'training_sent',
              title: 'Treino enviado',
              description: 'Treino personalizado enviado para cliente',
              date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              type: 'progress_logged',
              title: 'Progresso registrado',
              description: 'Cliente registrou evolução de peso',
              date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            }
          ]
        }))
        return
      }
      
      const response = await fetch(`${API_URL}/admin/recent-activity?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(prev => ({ ...prev, recentActivity: data }))
      } else {
        setAdminData(prev => ({ 
          ...prev, 
          recentActivity: [
            {
              type: 'new_user',
              title: 'Novo usuário cadastrado',
              description: 'Felipe Cordeiro Ferreira se cadastrou na plataforma',
              date: new Date().toISOString()
            }
          ]
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
    }
  }
  
  const fetchAnalytics = async () => {
    try {
      const token = await getAuthToken()
      
      const response = await fetch(`${API_URL}/admin/analytics/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(prev => ({ ...prev, analytics: data }))
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    }
  }
  
  const fetchUserDetails = async (userId) => {
    try {
      const token = await getAuthToken()
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error)
    }
  }
  
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = await getAuthToken()
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        alert('Papel do usuário atualizado com sucesso!')
        fetchUsers()
        if (selectedUser && selectedUser.user.id === userId) {
          fetchUserDetails(userId)
        }
      } else {
        alert('Erro ao atualizar papel do usuário')
      }
    } catch (error) {
      console.error('Erro ao atualizar papel:', error)
      alert('Erro ao atualizar papel do usuário')
    }
  }
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_user':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'training_sent':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'progress_logged':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'message_sent':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <div className="text-sm text-gray-500">
          Bem-vindo, {userProfile?.nome || user?.email}
        </div>
      </div>
      
      {/* Abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análises
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das abas */}
      {activeTab === 'overview' && adminData.overview && (
        <div className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Usuários"
              value={adminData.overview.total_users}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
              color="blue"
            />
            
            <StatCard
              title="Usuários Ativos"
              value={adminData.overview.active_users}
              change={`${adminData.overview.user_growth_rate}%`}
              changeType="positive"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              color="green"
            />
            
            <StatCard
              title="Assinaturas Ativas"
              value={adminData.overview.active_subscriptions}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
              color="purple"
            />
            
            <StatCard
              title="Receita Total"
              value={`R$ ${adminData.overview.total_revenue.toFixed(2)}`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              color="yellow"
            />
          </div>
          
          {/* Atividades recentes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
            {adminData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {adminData.recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.date).toLocaleDateString('pt-BR')} às {new Date(activity.date).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Busca de usuários */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Gerenciar Usuários</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Lista de usuários */}
            {adminData.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminData.users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nome || 'Nome não informado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role || 'cliente'}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="cliente">Cliente</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => fetchUserDetails(user.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Análises e Relatórios</h3>
            <p className="text-gray-500 text-center py-8">
              Funcionalidade de análises em desenvolvimento
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

