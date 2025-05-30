import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import { toast } from 'react-toastify'
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
  const { user, token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    weightData: [],
    completedWorkouts: 0,
    upcomingWorkouts: [],
    latestAssessment: null,
    weightChange: null,
    weightChangePercentage: null
  })
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return
      
      setIsLoading(true)
      
      try {
        // Configuração para requisições autenticadas
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        
        // Busca avaliações físicas
        const assessmentsResponse = await axios.get(`${API_URL}/assessments`, config)
        const assessments = assessmentsResponse.data || []
        
        // Busca registros de treinos
        const trainingLogsResponse = await axios.get(`${API_URL}/trainings/logs`, config)
        const trainingLogs = trainingLogsResponse.data || []
        
        // Busca planos de treino
        const trainingPlansResponse = await axios.get(`${API_URL}/trainings/plans`, config)
        const trainingPlans = trainingPlansResponse.data || []
        
        // Processa os dados para o dashboard
        const weightData = assessments.map(assessment => ({
          date: new Date(assessment.date).toLocaleDateString('pt-BR'),
          weight: assessment.weight
        })).reverse()
        
        const completedWorkouts = trainingLogs.filter(log => log.completed).length
        
        // Calcula mudança de peso
        let weightChange = null
        let weightChangePercentage = null
        
        if (assessments.length >= 2) {
          const latestWeight = assessments[0].weight
          const previousWeight = assessments[1].weight
          weightChange = latestWeight - previousWeight
          weightChangePercentage = (weightChange / previousWeight) * 100
        }
        
        // Atualiza o estado com os dados processados
        setStats({
          weightData,
          completedWorkouts,
          upcomingWorkouts: [], // Implementar lógica para treinos futuros
          latestAssessment: assessments.length > 0 ? assessments[0] : null,
          weightChange,
          weightChangePercentage
        })
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [token])
  
  // Configuração do gráfico de peso
  const weightChartData = {
    labels: stats.weightData.map(data => data.date),
    datasets: [
      {
        label: 'Peso (kg)',
        data: stats.weightData.map(data => data.weight),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.3
      }
    ]
  }
  
  const weightChartOptions = {
    responsive: true,
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
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumo em cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de peso atual */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Peso Atual</h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold">
                  {stats.latestAssessment ? `${stats.latestAssessment.weight} kg` : 'N/A'}
                </span>
                
                {stats.weightChange && (
                  <span className={`ml-2 text-sm ${stats.weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.weightChange < 0 ? '↓' : '↑'} {Math.abs(stats.weightChange).toFixed(1)} kg
                    ({Math.abs(stats.weightChangePercentage).toFixed(1)}%)
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.latestAssessment 
                  ? `Última medição: ${new Date(stats.latestAssessment.date).toLocaleDateString('pt-BR')}`
                  : 'Nenhuma avaliação registrada'}
              </p>
            </div>
            
            {/* Card de treinos concluídos */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Treinos Concluídos</h3>
              <div className="text-3xl font-bold">{stats.completedWorkouts}</div>
              <p className="text-sm text-gray-500 mt-1">Total de treinos realizados</p>
            </div>
            
            {/* Card de IMC */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">IMC</h3>
              <div className="text-3xl font-bold">
                {stats.latestAssessment && stats.latestAssessment.bmi 
                  ? stats.latestAssessment.bmi.toFixed(1)
                  : 'N/A'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.latestAssessment && stats.latestAssessment.bmi 
                  ? getIMCCategory(stats.latestAssessment.bmi)
                  : 'Dados insuficientes'}
              </p>
            </div>
          </div>
          
          {/* Gráfico de evolução de peso */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução do Peso</h3>
            {stats.weightData.length > 0 ? (
              <div className="h-64">
                <Line data={weightChartData} options={weightChartOptions} />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Sem dados suficientes para exibir o gráfico</p>
              </div>
            )}
          </div>
          
          {/* Próximos treinos */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Próximos Treinos</h3>
            {stats.upcomingWorkouts && stats.upcomingWorkouts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.upcomingWorkouts.map((workout, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{workout.name}</h4>
                        <p className="text-sm text-gray-500">{workout.date}</p>
                      </div>
                      <button className="btn btn-primary py-1 px-3 text-sm">
                        Ver Detalhes
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-32 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhum treino agendado</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Função auxiliar para determinar a categoria do IMC
const getIMCCategory = (imc) => {
  if (imc < 18.5) return 'Abaixo do peso'
  if (imc < 25) return 'Peso normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidade Grau I'
  if (imc < 40) return 'Obesidade Grau II'
  return 'Obesidade Grau III'
}

export default DashboardHome
