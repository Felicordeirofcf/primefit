import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TrainingPlan = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [trainings, setTrainings] = useState([])
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  
  useEffect(() => {
    const fetchTrainings = async () => {
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
        
        // Busca treinos do usuário
        const response = await fetch(`${API_URL}/trainings/`, config)
        
        if (response.ok) {
          const data = await response.json()
          setTrainings(data)
          
          // Seleciona o primeiro treino se existir
          if (data.length > 0) {
            setSelectedTraining(data[0])
          }
        } else {
          console.error('Erro ao buscar treinos:', response.statusText)
        }
      } catch (error) {
        console.error('Erro ao buscar treinos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTrainings()
  }, [user])
  
  const handleTrainingSelect = (training) => {
    setSelectedTraining(training)
    setShowPdfViewer(false)
  }
  
  const handleViewPdf = () => {
    setShowPdfViewer(true)
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getTrainingTypeLabel = (type) => {
    const types = {
      forca: 'Força',
      cardio: 'Cardio',
      funcional: 'Funcional',
      hiit: 'HIIT',
      yoga: 'Yoga',
      personalizado: 'Personalizado'
    }
    return types[type] || 'Não especificado'
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
        <h1 className="text-2xl font-bold">Meus Treinos</h1>
        <div className="text-sm text-gray-500">
          {trainings.length} treino{trainings.length !== 1 ? 's' : ''} disponível{trainings.length !== 1 ? 'is' : ''}
        </div>
      </div>
      
      {trainings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de treinos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Treinos Disponíveis</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {trainings.map((training) => (
                  <div
                    key={training.id}
                    onClick={() => handleTrainingSelect(training)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedTraining?.id === training.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {training.nome_arquivo.replace('.pdf', '')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(training.enviado_em)}
                        </p>
                        {training.tipo_treino && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                            {getTrainingTypeLabel(training.tipo_treino)}
                          </span>
                        )}
                      </div>
                      {training.ativo && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Detalhes do treino selecionado */}
          <div className="lg:col-span-2">
            {selectedTraining ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedTraining.nome_arquivo.replace('.pdf', '')}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Enviado em {formatDate(selectedTraining.enviado_em)}
                      </p>
                    </div>
                    <button
                      onClick={handleViewPdf}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Visualizar PDF
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informações do treino */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Treino</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tipo de Treino</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedTraining.tipo_treino ? getTrainingTypeLabel(selectedTraining.tipo_treino) : 'Não especificado'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Duração</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedTraining.duracao_semanas ? `${selectedTraining.duracao_semanas} semanas` : 'Não especificado'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedTraining.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedTraining.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    {/* Descrição e observações */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Detalhes</h4>
                      {selectedTraining.descricao && (
                        <div className="mb-4">
                          <dt className="text-sm font-medium text-gray-500 mb-1">Descrição</dt>
                          <dd className="text-sm text-gray-900">{selectedTraining.descricao}</dd>
                        </div>
                      )}
                      {selectedTraining.observacoes && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 mb-1">Observações</dt>
                          <dd className="text-sm text-gray-900">{selectedTraining.observacoes}</dd>
                        </div>
                      )}
                      {!selectedTraining.descricao && !selectedTraining.observacoes && (
                        <p className="text-sm text-gray-500 italic">Nenhuma descrição adicional disponível.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Visualizador de PDF */}
                  {showPdfViewer && selectedTraining.url_pdf && (
                    <div className="mt-6">
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 flex justify-between items-center">
                          <h5 className="text-sm font-medium text-gray-900">Visualização do Treino</h5>
                          <button
                            onClick={() => setShowPdfViewer(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="h-96">
                          <iframe
                            src={selectedTraining.url_pdf}
                            className="w-full h-full"
                            title="Visualizador de PDF do Treino"
                          />
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-300">
                          <a
                            href={selectedTraining.url_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Baixar PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-64">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-center">
                  Selecione um treino da lista para ver os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino disponível</h3>
          <p className="text-gray-500 mb-6">
            Você ainda não possui treinos cadastrados. Entre em contato com nossa equipe para receber seu plano personalizado.
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Solicitar Treino
          </button>
        </div>
      )}
    </div>
  )
}

export default TrainingPlan

