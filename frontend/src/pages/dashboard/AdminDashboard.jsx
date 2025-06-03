import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../supabaseClient'

const AdminDashboard = () => {
  const { user, userProfile, isAdmin } = useAuth() // ✅ Usar isAdmin do AuthContext
  const [isLoading, setIsLoading] = useState(true)
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
  
  // ✅ CORREÇÃO: Verificar se o usuário é admin usando isAdmin do AuthContext
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-500">Você não tem permissão para acessar o painel administrativo.</p>
        </div>
      </div>
    )
  }
  
  useEffect(() => {
    console.log('Carregando overview administrativo usando Supabase')
    loadAdminData()
  }, [activeTab, usersPagination.page, searchTerm])
  
  const loadAdminData = async () => {
    try {
      setIsLoading(true)
      
      if (activeTab === 'overview') {
        await fetchOverviewFromSupabase()
        await fetchRecentActivityMock()
      } else if (activeTab === 'users') {
        await fetchUsersFromSupabase()
      }
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchOverviewFromSupabase = async () => {
    try {
      // ✅ Buscar dados reais do Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
      
      if (error) {
        console.error('Erro ao buscar perfis:', error)
        return
      }
      
      const totalUsers = profiles?.length || 0
      const activeUsers = profiles?.filter(p => p.nome && p.objetivo)?.length || 0
      const activeSubscriptions = profiles?.filter(p => p.plano_ativo === 'ativo')?.length || 0
      
      console.log(`Total de usuários: ${totalUsers}, Usuários ativos: ${activeUsers}`)
      
      const overview = {
        total_users: totalUsers,
        active_users: activeUsers,
        active_subscriptions: activeSubscriptions,
        total_revenue: activeSubscriptions * 97.0, // R$ 97 por assinatura
        user_growth_rate: 15.2 // Mock
      }
      
      setAdminData(prev => ({ ...prev, overview }))
    } catch (error) {
      console.error('Erro ao buscar overview:', error)
    }
  }
  
  const fetchUsersFromSupabase = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Aplicar filtro de busca se houver
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }
      
      const { data: users, error } = await query
      
      if (error) {
        console.error('Erro ao buscar usuários:', error)
        return
      }
      
      setAdminData(prev => ({ ...prev, users: users || [] }))
      setUsersPagination(prev => ({
        ...prev,
        total: users?.length || 0,
        pages: Math.ceil((users?.length || 0) / prev.limit)
      }))
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }
  
  const fetchRecentActivityMock = async () => {
    // ✅ Dados mock para atividades recentes
    const recentActivity = [
      {
        type: 'new_user',
        title: 'Novo usuário cadastrado',
        description: 'Felipe Cordeiro Ferreira se cadastrou na plataforma',
        date: new Date().toISOString()
      },
      {
        type: 'progress_logged',
        title: 'Progresso registrado',
        description: 'Usuário atualizou seu peso e medidas',
        date: new Date(Date.now() - 3600000).toISOString()
      },
      {
        type: 'training_sent',
        title: 'Treino enviado',
        description: 'Novo plano de treino personalizado criado',
        date: new Date(Date.now() - 7200000).toISOString()
      },
      {
        type: 'message_sent',
        title: 'Mensagem enviada',
        description: 'Consultor enviou orientações nutricionais',
        date: new Date(Date.now() - 10800000).toISOString()
      }
    ]
    
    setAdminData(prev => ({ ...prev, recentActivity }))
  }
  
  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) {
        throw error
      }
      
      alert('Papel do usuário atualizado com sucesso!')
      await fetchUsersFromSupabase()
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                  <p className="text-2xl font-semibold text-gray-900">{adminData.overview.total_users}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Usuários Ativos</p>
                  <p className="text-2xl font-semibold text-gray-900">{adminData.overview.active_users}</p>
                  <p className="text-sm text-green-600">+{adminData.overview.user_growth_rate}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Assinaturas Ativas</p>
                  <p className="text-2xl font-semibold text-gray-900">{adminData.overview.active_subscriptions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Receita Total</p>
                  <p className="text-2xl font-semibold text-gray-900">R$ {adminData.overview.total_revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
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
                            <option value="consultor">Consultor</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver detalhes
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Análises e Relatórios</h3>
          <p className="text-gray-500 text-center py-8">
            Funcionalidade de análises em desenvolvimento
          </p>
        </div>
      )}
      
      {/* Modal de detalhes do usuário */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Usuário</h3>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {selectedUser.nome || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Telefone:</strong> {selectedUser.telefone || 'N/A'}</p>
                <p><strong>Objetivo:</strong> {selectedUser.objetivo || 'N/A'}</p>
                <p><strong>Plano:</strong> {selectedUser.plano_ativo || 'inativo'}</p>
                <p><strong>Papel:</strong> {selectedUser.role || 'cliente'}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

