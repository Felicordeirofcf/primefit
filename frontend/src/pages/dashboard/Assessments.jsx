import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

const Assessments = () => {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  
  // Dados simulados para demonstração
  useEffect(() => {
    // Simulação de chamada à API
    setTimeout(() => {
      const mockAssessments = [
        {
          id: 1,
          date: '2025-05-01',
          type: 'Completa',
          trainer: 'Ricardo Oliveira',
          metrics: {
            weight: 76.0,
            height: 175,
            bmi: 24.8,
            bodyFat: 20.5,
            muscleMass: 58.2,
            restingMetabolism: 1720,
            visceralFat: 8
          },
          measurements: {
            chest: 98,
            waist: 84,
            abdomen: 86,
            hips: 102,
            rightArm: 34,
            leftArm: 33.5,
            rightThigh: 58,
            leftThigh: 57.5,
            rightCalf: 38,
            leftCalf: 38
          },
          notes: "Boa evolução desde a última avaliação. Redução significativa na circunferência da cintura e percentual de gordura. Recomenda-se manter o plano atual com pequenos ajustes no treino de força para focar em hipertrofia dos membros superiores."
        },
        {
          id: 2,
          date: '2025-04-01',
          type: 'Completa',
          trainer: 'Ricardo Oliveira',
          metrics: {
            weight: 78.2,
            height: 175,
            bmi: 25.5,
            bodyFat: 21.3,
            muscleMass: 57.8,
            restingMetabolism: 1710,
            visceralFat: 9
          },
          measurements: {
            chest: 99,
            waist: 86,
            abdomen: 88,
            hips: 103,
            rightArm: 33.5,
            leftArm: 33,
            rightThigh: 59,
            leftThigh: 58.5,
            rightCalf: 38,
            leftCalf: 38
          },
          notes: "Progresso consistente. Redução de gordura corporal e aumento de massa muscular dentro do esperado. Recomenda-se aumentar a intensidade do treino cardiovascular para acelerar a perda de gordura."
        },
        {
          id: 3,
          date: '2025-03-01',
          type: 'Completa',
          trainer: 'Ricardo Oliveira',
          metrics: {
            weight: 80.3,
            height: 175,
            bmi: 26.2,
            bodyFat: 22.1,
            muscleMass: 57.5,
            restingMetabolism: 1700,
            visceralFat: 9
          },
          measurements: {
            chest: 101,
            waist: 88,
            abdomen: 90,
            hips: 104,
            rightArm: 33,
            leftArm: 32.5,
            rightThigh: 60,
            leftThigh: 59.5,
            rightCalf: 38.5,
            leftCalf: 38.5
          },
          notes: "Bom progresso inicial. Cliente demonstra boa adaptação ao plano de treinos e alimentação. Recomenda-se manter o plano atual e reavaliar em 4 semanas."
        }
      ]
      
      setAssessments(mockAssessments)
      setSelectedAssessment(mockAssessments[0])
      setLoading(false)
    }, 1500)
  }, [])
  
  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
  
  // Função para calcular a diferença entre duas avaliações
  const calculateDifference = (current, previous, metric) => {
    if (!current || !previous) return null
    
    const diff = current[metric] - previous[metric]
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0,
      isNegative: diff < 0
    }
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
        <h1 className="text-2xl font-bold">Minhas Avaliações</h1>
        <button className="btn btn-primary">Solicitar Nova Avaliação</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de avaliações */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h2 className="text-lg font-medium mb-4">Histórico</h2>
            <div className="space-y-2">
              {assessments.map(assessment => (
                <button
                  key={assessment.id}
                  onClick={() => setSelectedAssessment(assessment)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedAssessment?.id === assessment.id
                      ? 'bg-primary-100 text-primary-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{formatDate(assessment.date)}</div>
                  <div className="text-sm text-gray-500">
                    Avaliação {assessment.type} • {assessment.trainer}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Detalhes da avaliação selecionada */}
        <div className="lg:col-span-3">
          {selectedAssessment ? (
            <div className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Avaliação de {formatDate(selectedAssessment.date)}</h2>
                  <p className="text-gray-500">Realizada por {selectedAssessment.trainer}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar PDF
                  </button>
                </div>
              </div>
              
              {/* Métricas principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-4 bg-gray-50">
                  <div className="text-sm text-gray-500 mb-1">Peso</div>
                  <div className="text-xl font-bold">{selectedAssessment.metrics.weight} kg</div>
                  {assessments[1] && (
                    <div className="text-xs mt-1">
                      {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'weight').isNegative ? (
                        <span className="text-green-600">
                          ↓ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'weight').value} kg
                        </span>
                      ) : (
                        <span className="text-red-600">
                          ↑ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'weight').value} kg
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="card p-4 bg-gray-50">
                  <div className="text-sm text-gray-500 mb-1">IMC</div>
                  <div className="text-xl font-bold">{selectedAssessment.metrics.bmi}</div>
                  {assessments[1] && (
                    <div className="text-xs mt-1">
                      {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'bmi').isNegative ? (
                        <span className="text-green-600">
                          ↓ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'bmi').value}
                        </span>
                      ) : (
                        <span className="text-red-600">
                          ↑ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'bmi').value}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="card p-4 bg-gray-50">
                  <div className="text-sm text-gray-500 mb-1">% Gordura</div>
                  <div className="text-xl font-bold">{selectedAssessment.metrics.bodyFat}%</div>
                  {assessments[1] && (
                    <div className="text-xs mt-1">
                      {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'bodyFat').isNegative ? (
                        <span className="text-green-600">
                          ↓ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'bodyFat').value}%
                        </span>
                      ) : (
                        <span className="text-red-600">
                          ↑ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'bodyFat').value}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="card p-4 bg-gray-50">
                  <div className="text-sm text-gray-500 mb-1">Massa Muscular</div>
                  <div className="text-xl font-bold">{selectedAssessment.metrics.muscleMass} kg</div>
                  {assessments[1] && (
                    <div className="text-xs mt-1">
                      {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'muscleMass').isPositive ? (
                        <span className="text-green-600">
                          ↑ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'muscleMass').value} kg
                        </span>
                      ) : (
                        <span className="text-red-600">
                          ↓ {calculateDifference(selectedAssessment.metrics, assessments[1].metrics, 'muscleMass').value} kg
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tabs para diferentes seções */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button className="py-4 px-1 border-b-2 border-primary-600 text-primary-600 font-medium text-sm">
                      Detalhes
                    </button>
                    <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                      Comparar
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Métricas detalhadas */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Métricas Detalhadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Altura</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.metrics.height} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Peso</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.metrics.weight} kg</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">IMC</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.metrics.bmi}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">% de Gordura</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.metrics.bodyFat}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Massa Muscular</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.metrics.muscleMass} kg</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Metabolismo Basal</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.metrics.restingMetabolism} kcal</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Gordura Visceral</td>
                          <td className="py-2 text-sm font-medium text-right">Nível {selectedAssessment.metrics.visceralFat}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Medidas */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Medidas Corporais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Tórax</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.chest} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Cintura</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.waist} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Abdômen</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.abdomen} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Quadril</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.hips} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Braço Direito</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.rightArm} cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Braço Esquerdo</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.leftArm} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Coxa Direita</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.rightThigh} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Coxa Esquerda</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.leftThigh} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Panturrilha Direita</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.rightCalf} cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-sm text-gray-500">Panturrilha Esquerda</td>
                          <td className="py-2 text-sm font-medium text-right">{selectedAssessment.measurements.leftCalf} cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Observações */}
              <div>
                <h3 className="text-lg font-medium mb-4">Observações do Profissional</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedAssessment.notes}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500">Selecione uma avaliação para visualizar os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Assessments
