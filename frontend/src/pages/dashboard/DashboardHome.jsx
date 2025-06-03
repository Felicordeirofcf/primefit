import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DashboardHome = () => {
  const { user, userProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    userSummary: null,
    recentActivity: [],
    quickStats: null,
    progressData: []
  })
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      
      setIsLoading(true)
      
      try {
        // Busca token do localStorage ou sessionStorage
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
        
        if (!token) {
          console.error('Token não encontrado')
          return
        }
        
        // Configuração para requisições autenticadas
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        
        // Busca resumo do usuário
        const userSummaryResponse = await fetch(`${API_URL}/dashboard/user-summary`, config)
        const userSummary = userSummaryResponse.ok ? await userSummaryResponse.json() : null
        
        // Busca atividades recentes
        const recentActivityResponse = await fetch(`${API_URL}/dashboard/recent-activity`, config)
        const recentActivity = recentActivityResponse.ok ? await recentActivityResponse.json() : []
        
        // Busca estatísticas rápidas
        const quickStatsResponse = await fetch(`${API_URL}/dashboard/quick-stats`, config)
        const quickStats = quickStatsResponse.ok ? await quickStatsResponse.json() : null
        
        // Busca dados de progresso para gráficos
        const progressResponse = await fetch(`${API_URL}/progress?limit=10`, config)
        const progressData = progressResponse.ok ? await progressResponse.json() : []
        
        setDashboardData({
          userSummary,
          recentActivity,
          quickStats,
          progressData
        })
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])
  
  // Configuração do gráfico de peso
  const weightChartData = {
    labels: dashboardData.progressData.map(data => 
      new Date(data.data_medicao).toLocaleDateString('pt-BR')
    ).reverse(),
    datasets: [
      {
        label: 'Peso (kg)',
        data: dashboardData.progressData.map(data => data.peso).reverse(),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.3
      }
    ]
  }
  
  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução do Peso'
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho de boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6 rounded-lg">
        <h1 className="text-xl md:text-2xl font-bold mb-2">
          Bem-vindo de volta, {userProfile?.nome || user?.email}!
        </h1>
        <p className="text-blue-100 text-sm md:text-base">
          Aqui está um resumo do seu progresso e atividades recentes.
        </p>
      </div>
      
      {/* Cards de estatísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card de treinos */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 md:p-3 bg-blue-100 rounded-full flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Treinos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.userSummary?.total_treinos || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Card de progresso */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registros de Progresso</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.userSummary?.total_progresso || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Card de mensagens */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mensagens Não Lidas</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.userSummary?.mensagens_nao_lidas || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Card de evolução */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Evolução de Peso</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.quickStats?.evolucao_peso 
                  ? `${dashboardData.quickStats.evolucao_peso > 0 ? '+' : ''}${dashboardData.quickStats.evolucao_peso}kg`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico de evolução e atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de evolução de peso */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Evolução do Peso</h3>
          {dashboardData.progressData.length > 0 ? (
            <div className="h-64">
              <Line data={weightChartData} options={weightChartOptions} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Registre seu progresso para ver o gráfico</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Atividades recentes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
          {dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'treino' ? 'bg-blue-100' :
                    activity.type === 'progresso' ? 'bg-green-100' :
                    'bg-yellow-100'
                  }`}>
                    {activity.type === 'treino' && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {activity.type === 'progresso' && (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                    {activity.type === 'mensagem' && (
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-32 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Informações do plano ativo */}
      {dashboardData.userSummary?.assinatura_ativa && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Plano Ativo</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {dashboardData.userSummary.assinatura_ativa.plano_id === 'serie_unica' 
                  ? 'Série Única' 
                  : 'Consultoria Completa'}
              </p>
              <p className="text-sm text-gray-500">
                Válido até: {new Date(dashboardData.userSummary.assinatura_ativa.data_fim).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                R$ {dashboardData.userSummary.assinatura_ativa.valor_pago}
              </p>
              <p className="text-sm text-gray-500">Valor pago</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardHome

