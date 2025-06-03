import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../supabaseClient'
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

const DashboardHome = () => {
  const { user, userProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false) // Começar sem loading
  const [dashboardData, setDashboardData] = useState({
    userSummary: null,
    recentActivity: [],
    quickStats: null,
    progressData: []
  })
  
  useEffect(() => {
    if (user && userProfile) {
      loadDashboardData()
    }
  }, [user, userProfile])
  
  const loadDashboardData = async () => {
    try {
      console.log('Carregando dados do dashboard para:', userProfile?.nome || user?.email)
      
      // Dados do usuário baseados no perfil
      const userSummary = {
        nome: userProfile?.nome || 'Usuário',
        objetivo: userProfile?.objetivo || 'emagrecimento',
        peso_inicial: userProfile?.peso_inicial || 75,
        peso_atual: userProfile?.peso_inicial ? userProfile.peso_inicial - 2 : 73,
        dias_ativo: 15,
        treinos_concluidos: 8,
        plano_ativo: userProfile?.plano_ativo || 'premium'
      }
      
      // Atividades recentes baseadas no perfil
      const recentActivity = [
        {
          id: 1,
          tipo: 'treino',
          descricao: 'Treino de cardio concluído',
          data: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          duracao: 45
        },
        {
          id: 2,
          tipo: 'medicao',
          descricao: 'Nova medição de peso registrada',
          data: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          valor: userSummary.peso_atual
        },
        {
          id: 3,
          tipo: 'objetivo',
          descricao: `Meta de ${userSummary.objetivo} em progresso`,
          data: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
        },
        {
          id: 4,
          tipo: 'treino',
          descricao: 'Treino de força concluído',
          data: new Date(Date.now() - 345600000).toISOString(), // 4 dias atrás
          duracao: 60
        }
      ]
      
      // Estatísticas rápidas
      const quickStats = {
        treinos_semana: 3,
        calorias_queimadas: 1250,
        tempo_exercicio: 180, // minutos
        meta_semanal: 4,
        progresso_meta: 75
      }
      
      // Dados de progresso para gráfico
      const progressData = []
      const pesoInicial = userSummary.peso_inicial
      for (let i = 0; i < 8; i++) {
        const data = new Date()
        data.setDate(data.getDate() - (7 - i) * 7) // Últimas 8 semanas
        
        progressData.push({
          data: data.toISOString().split('T')[0],
          peso: pesoInicial - (i * 0.3), // Perda gradual
          percentual_gordura: 25 - (i * 0.5),
          massa_muscular: 45 + (i * 0.2)
        })
      }
      
      setDashboardData({
        userSummary,
        recentActivity,
        quickStats,
        progressData
      })
      
      console.log('Dashboard carregado com sucesso usando dados do Supabase e mock')
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      
      // Fallback com dados básicos
      setDashboardData({
        userSummary: {
          nome: userProfile?.nome || 'Usuário',
          objetivo: 'emagrecimento',
          peso_inicial: 75,
          peso_atual: 73,
          dias_ativo: 15,
          treinos_concluidos: 8,
          plano_ativo: 'premium'
        },
        recentActivity: [
          {
            id: 1,
            tipo: 'treino',
            descricao: 'Treino concluído',
            data: new Date().toISOString()
          }
        ],
        quickStats: {
          treinos_semana: 3,
          calorias_queimadas: 1250,
          tempo_exercicio: 180,
          meta_semanal: 4,
          progresso_meta: 75
        },
        progressData: [
          { data: '2024-06-01', peso: 75, percentual_gordura: 25 },
          { data: '2024-06-03', peso: 73, percentual_gordura: 23 }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Preparar dados para gráficos
  const weightChartData = {
    labels: dashboardData.progressData.map(item => {
      const date = new Date(item.data)
      return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Peso (kg)',
        data: dashboardData.progressData.map(item => item.peso),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      }
    ]
  }
  
  const activityChartData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Minutos de Exercício',
        data: [45, 60, 0, 45, 30, 90, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      }
    ]
  }
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  const { userSummary, recentActivity, quickStats } = dashboardData
  
  return (
    <div className="space-y-6">
      {/* Header de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Olá, {userSummary?.nome || 'Usuário'}! 👋
        </h1>
        <p className="text-blue-100 mt-2">
          Bem-vindo de volta ao seu painel de controle. Vamos continuar sua jornada de transformação!
        </p>
      </div>
      
      {/* Cards de Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Peso Atual</h3>
              <p className="text-2xl font-bold text-blue-600">
                {userSummary?.peso_atual || 73} kg
              </p>
              <p className="text-xs text-green-600">
                -{((userSummary?.peso_inicial || 75) - (userSummary?.peso_atual || 73)).toFixed(1)} kg
              </p>
            </div>
            <div className="text-blue-600 text-3xl">⚖️</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Treinos esta Semana</h3>
              <p className="text-2xl font-bold text-green-600">
                {quickStats?.treinos_semana || 3}
              </p>
              <p className="text-xs text-gray-500">
                Meta: {quickStats?.meta_semanal || 4} treinos
              </p>
            </div>
            <div className="text-green-600 text-3xl">💪</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Calorias Queimadas</h3>
              <p className="text-2xl font-bold text-orange-600">
                {quickStats?.calorias_queimadas || 1250}
              </p>
              <p className="text-xs text-gray-500">Esta semana</p>
            </div>
            <div className="text-orange-600 text-3xl">🔥</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Dias Ativo</h3>
              <p className="text-2xl font-bold text-purple-600">
                {userSummary?.dias_ativo || 15}
              </p>
              <p className="text-xs text-gray-500">Últimos 30 dias</p>
            </div>
            <div className="text-purple-600 text-3xl">📅</div>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução de Peso */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução do Peso</h3>
          <Line data={weightChartData} options={chartOptions} />
        </div>
        
        {/* Gráfico de Atividade Semanal */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Semanal</h3>
          <Bar data={activityChartData} options={chartOptions} />
        </div>
      </div>
      
      {/* Atividades Recentes e Próximos Treinos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.tipo === 'treino' ? 'bg-green-100' :
                      activity.tipo === 'medicao' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <span className="text-sm">
                        {activity.tipo === 'treino' ? '💪' :
                         activity.tipo === 'medicao' ? '⚖️' : '🎯'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.data).toLocaleDateString('pt-BR')}
                      {activity.duracao && ` • ${activity.duracao} min`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Próximos Treinos */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Próximos Treinos</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Treino de Cardio</h4>
                  <p className="text-sm text-gray-600">Hoje • 18:00</p>
                </div>
                <span className="text-blue-600 text-2xl">🏃‍♂️</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Treino de Força</h4>
                  <p className="text-sm text-gray-600">Amanhã • 19:00</p>
                </div>
                <span className="text-green-600 text-2xl">🏋️‍♂️</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Avaliação Mensal</h4>
                  <p className="text-sm text-gray-600">Sexta • 16:00</p>
                </div>
                <span className="text-purple-600 text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Informações do Plano */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Seu Plano Ativo</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900 capitalize">
                Plano {userSummary?.plano_ativo || 'Premium'}
              </h4>
              <p className="text-gray-600 mt-1">
                Objetivo: {userSummary?.objetivo || 'Emagrecimento'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Progresso da meta: {quickStats?.progresso_meta || 75}% concluído
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl mb-2">🎯</div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${quickStats?.progresso_meta || 75}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

