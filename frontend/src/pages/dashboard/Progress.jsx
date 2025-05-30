import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Progress = () => {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState({
    weight: [],
    measurements: {
      chest: [],
      waist: [],
      hips: [],
      thighs: [],
      arms: []
    },
    bodyFat: []
  })
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weight')
  
  // Dados simulados para demonstração
  useEffect(() => {
    // Simulação de chamada à API
    setTimeout(() => {
      const mockData = {
        weight: [
          { date: '2025-01-01', value: 85.5 },
          { date: '2025-01-15', value: 84.2 },
          { date: '2025-02-01', value: 82.8 },
          { date: '2025-02-15', value: 81.5 },
          { date: '2025-03-01', value: 80.3 },
          { date: '2025-03-15', value: 79.1 },
          { date: '2025-04-01', value: 78.2 },
          { date: '2025-04-15', value: 77.5 },
          { date: '2025-05-01', value: 76.8 },
          { date: '2025-05-15', value: 76.0 }
        ],
        measurements: {
          chest: [
            { date: '2025-01-01', value: 105 },
            { date: '2025-02-01', value: 103 },
            { date: '2025-03-01', value: 101 },
            { date: '2025-04-01', value: 99 },
            { date: '2025-05-01', value: 98 }
          ],
          waist: [
            { date: '2025-01-01', value: 92 },
            { date: '2025-02-01', value: 90 },
            { date: '2025-03-01', value: 88 },
            { date: '2025-04-01', value: 86 },
            { date: '2025-05-01', value: 84 }
          ],
          hips: [
            { date: '2025-01-01', value: 108 },
            { date: '2025-02-01', value: 106 },
            { date: '2025-03-01', value: 104 },
            { date: '2025-04-01', value: 103 },
            { date: '2025-05-01', value: 102 }
          ],
          thighs: [
            { date: '2025-01-01', value: 62 },
            { date: '2025-02-01', value: 61 },
            { date: '2025-03-01', value: 60 },
            { date: '2025-04-01', value: 59 },
            { date: '2025-05-01', value: 58 }
          ],
          arms: [
            { date: '2025-01-01', value: 36 },
            { date: '2025-02-01', value: 35.5 },
            { date: '2025-03-01', value: 35 },
            { date: '2025-04-01', value: 34.5 },
            { date: '2025-05-01', value: 34 }
          ]
        },
        bodyFat: [
          { date: '2025-01-01', value: 24.5 },
          { date: '2025-02-01', value: 23.2 },
          { date: '2025-03-01', value: 22.1 },
          { date: '2025-04-01', value: 21.3 },
          { date: '2025-05-01', value: 20.5 }
        ]
      }
      
      setProgressData(mockData)
      setLoading(false)
    }, 1500)
  }, [])
  
  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
  
  // Função para calcular a diferença entre o primeiro e o último valor
  const calculateDifference = (dataArray) => {
    if (!dataArray || dataArray.length < 2) return 0
    
    const firstValue = dataArray[0].value
    const lastValue = dataArray[dataArray.length - 1].value
    
    return (lastValue - firstValue).toFixed(1)
  }
  
  // Função para renderizar o gráfico (simplificada para este exemplo)
  const renderChart = (data, label, color = 'primary') => {
    if (!data || data.length === 0) return null
    
    // Encontrar valores mínimo e máximo para escala
    const values = data.map(item => item.value)
    const minValue = Math.min(...values) * 0.95
    const maxValue = Math.max(...values) * 1.05
    const range = maxValue - minValue
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">{label}</h3>
        <div className="relative h-64 bg-gray-100 rounded-lg p-4">
          {/* Eixo Y */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 py-2">
            <span>{maxValue.toFixed(1)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
            <span>{minValue.toFixed(1)}</span>
          </div>
          
          {/* Área do gráfico */}
          <div className="ml-12 h-full flex items-end">
            {data.map((item, index) => {
              const height = ((item.value - minValue) / range) * 100
              
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-end mx-1 flex-1"
                >
                  <div 
                    className={`w-full bg-${color}-600 rounded-t`} 
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                    {formatDate(item.date)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  
  // Função para renderizar tabela de dados
  const renderDataTable = (data, label) => {
    if (!data || data.length === 0) return null
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">{label}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferença
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => {
                const prevValue = index > 0 ? data[index - 1].value : item.value
                const difference = item.value - prevValue
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {index === 0 ? (
                        '-'
                      ) : (
                        <span className={difference < 0 ? 'text-green-600' : 'text-red-600'}>
                          {difference > 0 ? '+' : ''}{difference.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meu Progresso</h1>
        <button className="btn btn-primary">Registrar Medidas</button>
      </div>
      
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-2">Peso</h3>
          <div className="flex items-end">
            <div className="text-3xl font-bold">
              {progressData.weight[progressData.weight.length - 1]?.value} kg
            </div>
            <div className="ml-2 text-sm">
              <span className={calculateDifference(progressData.weight) < 0 ? 'text-green-600' : 'text-red-600'}>
                {calculateDifference(progressData.weight) > 0 ? '+' : ''}
                {calculateDifference(progressData.weight)} kg
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1">Desde o início</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-2">Cintura</h3>
          <div className="flex items-end">
            <div className="text-3xl font-bold">
              {progressData.measurements.waist[progressData.measurements.waist.length - 1]?.value} cm
            </div>
            <div className="ml-2 text-sm">
              <span className={calculateDifference(progressData.measurements.waist) < 0 ? 'text-green-600' : 'text-red-600'}>
                {calculateDifference(progressData.measurements.waist) > 0 ? '+' : ''}
                {calculateDifference(progressData.measurements.waist)} cm
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1">Desde o início</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-2">% de Gordura</h3>
          <div className="flex items-end">
            <div className="text-3xl font-bold">
              {progressData.bodyFat[progressData.bodyFat.length - 1]?.value}%
            </div>
            <div className="ml-2 text-sm">
              <span className={calculateDifference(progressData.bodyFat) < 0 ? 'text-green-600' : 'text-red-600'}>
                {calculateDifference(progressData.bodyFat) > 0 ? '+' : ''}
                {calculateDifference(progressData.bodyFat)}%
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1">Desde o início</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('weight')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'weight'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Peso
            </button>
            <button
              onClick={() => setActiveTab('measurements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'measurements'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Medidas
            </button>
            <button
              onClick={() => setActiveTab('bodyFat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bodyFat'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              % de Gordura
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'photos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fotos
            </button>
          </nav>
        </div>
      </div>
      
      {/* Conteúdo da tab */}
      <div>
        {activeTab === 'weight' && (
          <div>
            {renderChart(progressData.weight, 'Evolução do Peso (kg)', 'primary')}
            {renderDataTable(progressData.weight, 'Histórico de Peso')}
          </div>
        )}
        
        {activeTab === 'measurements' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderChart(progressData.measurements.chest, 'Tórax (cm)', 'blue')}
              {renderChart(progressData.measurements.waist, 'Cintura (cm)', 'green')}
              {renderChart(progressData.measurements.hips, 'Quadril (cm)', 'yellow')}
              {renderChart(progressData.measurements.thighs, 'Coxas (cm)', 'purple')}
              {renderChart(progressData.measurements.arms, 'Braços (cm)', 'pink')}
            </div>
          </div>
        )}
        
        {activeTab === 'bodyFat' && (
          <div>
            {renderChart(progressData.bodyFat, 'Evolução do Percentual de Gordura (%)', 'accent')}
            {renderDataTable(progressData.bodyFat, 'Histórico de Percentual de Gordura')}
          </div>
        )}
        
        {activeTab === 'photos' && (
          <div>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma foto ainda</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece a registrar seu progresso visual.
              </p>
              <div className="mt-6">
                <button className="btn btn-primary">
                  Adicionar Fotos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Dicas */}
      <div className="mt-12">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Dicas para acompanhar seu progresso</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Registre seu peso sempre no mesmo horário, preferencialmente pela manhã</li>
            <li>Tire suas medidas sempre nos mesmos pontos do corpo</li>
            <li>Tire fotos de progresso a cada 4 semanas, usando a mesma iluminação e posição</li>
            <li>Lembre-se que a composição corporal é mais importante que o peso na balança</li>
            <li>Celebre pequenas vitórias ao longo do caminho!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Progress
