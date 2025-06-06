import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'https://primefit-production.up.railway.app'

const Assessments = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [assessments, setAssessments] = useState([])
  const [activeTab, setActiveTab] = useState('list')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [formData, setFormData] = useState({
    tipo_avaliacao: 'inicial',
    restricoes_medicas: '',
    medicamentos_uso: '',
    lesoes_anteriores: '',
    experiencia_exercicio: '',
    disponibilidade_treino: '',
    local_treino: '',
    equipamentos_disponiveis: [],
    objetivos_especificos: '',
    expectativas: '',
    data_avaliacao: new Date().toISOString().split('T')[0]
  })
  
  useEffect(() => {
    fetchAssessments()
  }, [user])
  
  const fetchAssessments = async () => {
    if (!user) return
    
    setIsLoading(true)
    
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
      
      const response = await fetch(`${API_URL}/assessments/`, config)
      
      if (response.ok) {
        const data = await response.json()
        setAssessments(data)
      } else {
        console.error('Erro ao buscar avaliações:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
    } finally {
      setIsLoading(false)
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
      
      const response = await fetch(`${API_URL}/assessments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert('Avaliação criada com sucesso!')
        setShowCreateForm(false)
        setFormData({
          tipo_avaliacao: 'inicial',
          restricoes_medicas: '',
          medicamentos_uso: '',
          lesoes_anteriores: '',
          experiencia_exercicio: '',
          disponibilidade_treino: '',
          local_treino: '',
          equipamentos_disponiveis: [],
          objetivos_especificos: '',
          expectativas: '',
          data_avaliacao: new Date().toISOString().split('T')[0]
        })
        fetchAssessments()
      } else {
        const errorData = await response.json()
        alert(`Erro ao criar avaliação: ${errorData.detail || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      alert('Erro ao criar avaliação')
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (name === 'equipamentos_disponiveis') {
        setFormData(prev => ({
          ...prev,
          equipamentos_disponiveis: checked
            ? [...prev.equipamentos_disponiveis, value]
            : prev.equipamentos_disponiveis.filter(item => item !== value)
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'concluida':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluida':
        return 'Concluída'
      case 'cancelada':
        return 'Cancelada'
      default:
        return 'Desconhecido'
    }
  }
  
  const equipmentOptions = [
    'Halteres',
    'Barras',
    'Anilhas',
    'Elásticos',
    'Kettlebells',
    'Bola de Pilates',
    'Colchonete',
    'Banco',
    'Barra Fixa',
    'Esteira',
    'Bicicleta Ergométrica'
  ]
  
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
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Avaliação
        </button>
      </div>
      
      {/* Abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Minhas Avaliações
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das abas */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Avaliação {assessment.tipo_avaliacao}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                        {getStatusLabel(assessment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Criada em {new Date(assessment.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                    {assessment.data_avaliacao && (
                      <p className="text-sm text-gray-500">
                        Data da avaliação: {new Date(assessment.data_avaliacao).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedAssessment(assessment)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver Detalhes
                  </button>
                </div>
                
                {assessment.objetivos_especificos && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Objetivos:</span> {assessment.objetivos_especificos}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-gray-500 mb-6">
                Você ainda não possui avaliações. Crie sua primeira avaliação para começar.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Criar Primeira Avaliação
              </button>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico de Avaliações</h3>
          {assessments.filter(a => a.status === 'concluida').length > 0 ? (
            <div className="space-y-4">
              {assessments
                .filter(a => a.status === 'concluida')
                .map((assessment) => (
                  <div key={assessment.id} className="border-l-4 border-green-400 pl-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Avaliação {assessment.tipo_avaliacao}</h4>
                        <p className="text-sm text-gray-500">
                          Concluída em {new Date(assessment.data_atualizacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedAssessment(assessment)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma avaliação concluída ainda.</p>
          )}
        </div>
      )}
      
      {/* Modal de detalhes da avaliação */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes da Avaliação {selectedAssessment.tipo_avaliacao}
                </h3>
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAssessment.status)}`}>
                      {getStatusLabel(selectedAssessment.status)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Avaliação</label>
                    <p className="text-sm text-gray-900">
                      {selectedAssessment.data_avaliacao 
                        ? new Date(selectedAssessment.data_avaliacao).toLocaleDateString('pt-BR')
                        : 'Não definida'}
                    </p>
                  </div>
                </div>
                
                {selectedAssessment.restricoes_medicas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Restrições Médicas</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.restricoes_medicas}</p>
                  </div>
                )}
                
                {selectedAssessment.experiencia_exercicio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experiência com Exercícios</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.experiencia_exercicio}</p>
                  </div>
                )}
                
                {selectedAssessment.objetivos_especificos && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Objetivos Específicos</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.objetivos_especificos}</p>
                  </div>
                )}
                
                {selectedAssessment.expectativas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expectativas</label>
                    <p className="text-sm text-gray-900">{selectedAssessment.expectativas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de criar avaliação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nova Avaliação</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
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
                    <label className="block text-sm font-medium text-gray-700">Tipo de Avaliação</label>
                    <select
                      name="tipo_avaliacao"
                      value={formData.tipo_avaliacao}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="inicial">Inicial</option>
                      <option value="reavaliacao">Reavaliação</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Avaliação</label>
                    <input
                      type="date"
                      name="data_avaliacao"
                      value={formData.data_avaliacao}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Restrições Médicas</label>
                  <textarea
                    name="restricoes_medicas"
                    value={formData.restricoes_medicas}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva qualquer restrição médica ou condição de saúde..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experiência com Exercícios</label>
                  <textarea
                    name="experiencia_exercicio"
                    value={formData.experiencia_exercicio}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva sua experiência anterior com exercícios..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Objetivos Específicos</label>
                  <textarea
                    name="objetivos_especificos"
                    value={formData.objetivos_especificos}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Quais são seus objetivos com o treinamento?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Equipamentos Disponíveis</label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <label key={equipment} className="flex items-center">
                        <input
                          type="checkbox"
                          name="equipamentos_disponiveis"
                          value={equipment}
                          checked={formData.equipamentos_disponiveis.includes(equipment)}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expectativas</label>
                  <textarea
                    name="expectativas"
                    value={formData.expectativas}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="O que você espera alcançar com este programa?"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Criar Avaliação
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

export default Assessments

