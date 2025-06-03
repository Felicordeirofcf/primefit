import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
)

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Progress = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [progressData, setProgressData] = useState([])
  const [summary, setSummary] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    peso: '',
    percentual_gordura: '',
    massa_muscular: '',
    circunferencia_cintura: '',
    circunferencia_quadril: '',
    circunferencia_braco: '',
    circunferencia_coxa: '',
    pressao_arterial_sistolica: '',
    pressao_arterial_diastolica: '',
    frequencia_cardiaca_repouso: '',
    observacoes: '',
    data_medicao: new Date().toISOString().split('T')[0]
  })
  
  useEffect(() => {
    fetchProgressData()
    fetchProgressSummary()
  }, [user])
  
  const fetchProgressData = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      
      if (!token) {
        console.error('Token não encontrado')
        return
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      const response = await fetch(`${API_URL}/progress/`, config)
      
      if (response.ok) {
        const data = await response.json()
        setProgressData(data)
      } else {
        console.error('Erro ao buscar dados de progresso:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchProgressSummary = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      
      if (!token) return
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      const response = await fetch(`${API_URL}/progress/stats/summary`, config)
      
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Erro ao buscar resumo de progresso:', error)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      
      if (!token) {
        alert('Token não encontrado')
        return
      }
      
      // Prepara os dados, convertendo strings vazias para null
      const submitData = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          submitData[key] = null
        } else if (key === 'data_medicao' || key === 'observacoes') {
          submitData[key] = formData[key]
        } else {
          submitData[key] = parseFloat(formData[key]) || null
        }
      })
      
      const response = await fetch(`${API_URL}/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })
      
      if (response.ok) {
        alert('Progresso registrado com sucesso!')
        setShowAddForm(false)
        setFormData({
          peso: '',
          percentual_gordura: '',
          massa_muscular: '',
          circunferencia_cintura: '',
          circunferencia_quadril: '',
          circunferencia_braco: '',
          circunferencia_coxa: '',
          pressao_arterial_sistolica: '',
          pressao_arterial_diastolica: '',
          frequencia_cardiaca_repouso: '',
          observacoes: '',
          data_medicao: new Date().toISOString().split('T')[0]
        })
        fetchProgressData()
        fetchProgressSummary()
      } else {
        const errorData = await response.json()
        alert(`Erro ao registrar progresso: ${errorData.detail || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao registrar progresso:', error)
      alert('Erro ao registrar progresso')
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Configuração do gráfico de peso
  const weightChartData = {
    labels: progressData.map(data => 
      new Date(data.data_medicao).toLocaleDateString('pt-BR')
    ).reverse(),
    datasets: [
      {
        label: 'Peso (kg)',
        data: progressData.map(data => data.peso).reverse(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
  
  // Configuração do gráfico de percentual de gordura
  const bodyFatChartData = {
    labels: progressData.map(data => 
      new Date(data.data_medicao).toLocaleDateString('pt-BR')
    ).reverse(),
    datasets: [
      {
        label: 'Percentual de Gordura (%)',
        data: progressData.map(data => data.percentual_gordura).reverse(),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meu Progresso</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar Progresso
        </button>
      </div>
      
      {/* Resumo estatístico */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Medições</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_medicoes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evolução de Peso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.evolucao_peso !== null 
                    ? `${summary.evolucao_peso > 0 ? '+' : ''}${summary.evolucao_peso}kg`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Peso Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.peso_atual ? `${summary.peso_atual}kg` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gordura Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.gordura_atual ? `${summary.gordura_atual}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Gráficos */}
      {progressData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Evolução do Peso</h3>
            <div className="h-64">
              <Line data={weightChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Percentual de Gordura</h3>
            <div className="h-64">
              <Line data={bodyFatChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
      
      {/* Histórico de medições */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Histórico de Medições</h3>
        </div>
        {progressData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Gordura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Massa Muscular</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cintura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progressData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.data_medicao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.peso ? `${entry.peso} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.percentual_gordura ? `${entry.percentual_gordura}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.massa_muscular ? `${entry.massa_muscular} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.circunferencia_cintura ? `${entry.circunferencia_cintura} cm` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {entry.observacoes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Nenhum registro de progresso encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Registrar Progresso" para começar</p>
          </div>
        )}
      </div>
      
      {/* Modal de adicionar progresso */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Registrar Novo Progresso</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Medição</label>
                    <input
                      type="date"
                      name="data_medicao"
                      value={formData.data_medicao}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="peso"
                      value={formData.peso}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 70.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Percentual de Gordura (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="percentual_gordura"
                      value={formData.percentual_gordura}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 15.2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Massa Muscular (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="massa_muscular"
                      value={formData.massa_muscular}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 45.3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Circunferência da Cintura (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="circunferencia_cintura"
                      value={formData.circunferencia_cintura}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 85.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Circunferência do Quadril (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="circunferencia_quadril"
                      value={formData.circunferencia_quadril}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 95.0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações sobre esta medição..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Progress

