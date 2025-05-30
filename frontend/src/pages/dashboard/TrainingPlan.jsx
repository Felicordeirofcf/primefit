import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import { toast } from 'react-toastify'

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TrainingPlan = () => {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [trainingPlans, setTrainingPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  
  useEffect(() => {
    const fetchTrainingPlans = async () => {
      if (!token) return
      
      setIsLoading(true)
      
      try {
        // Configuração para requisições autenticadas
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        
        // Busca planos de treino
        const response = await axios.get(`${API_URL}/trainings/plans`, config)
        
        if (response.data && response.data.length > 0) {
          setTrainingPlans(response.data)
          setSelectedPlan(response.data[0])
          
          // Seleciona o primeiro treino do plano
          if (response.data[0].trainings && response.data[0].trainings.length > 0) {
            setSelectedDay(response.data[0].trainings[0])
          }
        }
      } catch (error) {
        console.error('Erro ao buscar planos de treino:', error)
        toast.error('Erro ao carregar planos de treino')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTrainingPlans()
  }, [token])
  
  const handlePlanChange = (planId) => {
    const plan = trainingPlans.find(p => p.id === planId)
    setSelectedPlan(plan)
    
    // Seleciona o primeiro treino do plano
    if (plan && plan.trainings && plan.trainings.length > 0) {
      setSelectedDay(plan.trainings[0])
    } else {
      setSelectedDay(null)
    }
  }
  
  const handleDayChange = (trainingId) => {
    if (selectedPlan && selectedPlan.trainings) {
      const training = selectedPlan.trainings.find(t => t.id === trainingId)
      setSelectedDay(training)
    }
  }
  
  const handleCompleteWorkout = async () => {
    if (!token || !selectedDay) return
    
    try {
      // Configuração para requisições autenticadas
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      // Dados para o registro de treino
      const trainingLogData = {
        user_id: selectedPlan.user_id,
        training_id: selectedDay.id,
        date: new Date().toISOString(),
        completed: true,
        notes: "Treino concluído via dashboard"
      }
      
      // Registra o treino como concluído
      await axios.post(`${API_URL}/trainings/logs`, trainingLogData, config)
      
      toast.success('Treino registrado como concluído!')
    } catch (error) {
      console.error('Erro ao registrar treino:', error)
      toast.error('Erro ao registrar treino')
    }
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Meus Treinos</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {trainingPlans.length > 0 ? (
            <>
              {/* Seletor de plano de treino */}
              {trainingPlans.length > 1 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Selecione o Plano de Treino</h3>
                  <select 
                    className="input"
                    value={selectedPlan?.id || ''}
                    onChange={(e) => handlePlanChange(e.target.value)}
                  >
                    {trainingPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {selectedPlan && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Detalhes do plano */}
                  <div className="md:col-span-1">
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold mb-4">Detalhes do Plano</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nome do Plano</p>
                          <p className="font-medium">{selectedPlan.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Descrição</p>
                          <p>{selectedPlan.description || 'Sem descrição'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data de Início</p>
                          <p>{new Date(selectedPlan.start_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        {selectedPlan.end_date && (
                          <div>
                            <p className="text-sm text-gray-500">Data de Término</p>
                            <p>{new Date(selectedPlan.end_date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Seletor de dia de treino */}
                    {selectedPlan.trainings && selectedPlan.trainings.length > 0 && (
                      <div className="card p-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">Dias de Treino</h3>
                        <div className="space-y-2">
                          {selectedPlan.trainings.map(training => (
                            <button
                              key={training.id}
                              onClick={() => handleDayChange(training.id)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                selectedDay && selectedDay.id === training.id
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {training.name || `Treino ${training.day_of_week || ''}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detalhes do treino selecionado */}
                  <div className="md:col-span-2">
                    {selectedDay ? (
                      <div className="card p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold">{selectedDay.name || `Treino ${selectedDay.day_of_week || ''}`}</h3>
                          <button 
                            onClick={handleCompleteWorkout}
                            className="btn btn-primary py-2"
                          >
                            Marcar como Concluído
                          </button>
                        </div>
                        
                        {selectedDay.description && (
                          <p className="mb-6 text-gray-600">{selectedDay.description}</p>
                        )}
                        
                        {selectedDay.exercise_sets && selectedDay.exercise_sets.length > 0 ? (
                          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Exercício</th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Séries</th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Repetições</th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Carga</th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descanso</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {selectedDay.exercise_sets.map((set, index) => (
                                  <tr key={index}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                      {set.exercise_id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{set.sets}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{set.reps}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {set.weight ? `${set.weight} kg` : '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {set.rest_time ? `${set.rest_time}s` : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-32 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Nenhum exercício encontrado para este treino</p>
                          </div>
                        )}
                        
                        {selectedDay.notes && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Observações:</h4>
                            <p className="text-gray-600">{selectedDay.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="card p-6 flex justify-center items-center h-64">
                        <p className="text-gray-500">Selecione um dia de treino para ver os detalhes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center h-64">
              <p className="text-gray-500 mb-4">Você ainda não possui planos de treino</p>
              <button className="btn btn-primary">Solicitar Plano de Treino</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainingPlan
