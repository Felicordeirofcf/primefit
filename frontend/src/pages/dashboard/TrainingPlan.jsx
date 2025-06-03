import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth provides user, loading, and session

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TrainingPlan = () => {
  // Use auth hook to get user, loading status, and session
  const { user, loading: authLoading, session } = useAuth();

  // Component-specific loading state for data fetching
  const [dataLoading, setDataLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [error, setError] = useState(null); // State to hold potential errors

  const getToken = () => {
    // Prefer getting token from the session object
    if (session?.access_token) {
        return session.access_token;
    }
    // Fallback (less ideal)
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

  // Effect to fetch trainings when authentication is confirmed and user exists
  useEffect(() => {
    const fetchTrainings = async () => {
      setDataLoading(true); // Start data loading
      setError(null); // Reset error state
      const token = getToken();

      if (!token) {
        console.error('Token não encontrado para buscar treinos.');
        setError('Autenticação necessária para buscar treinos.');
        setDataLoading(false);
        setTrainings([]); // Clear trainings if no token
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await fetch(`${API_URL}/trainings/`, config);

        if (response.ok) {
          const data = await response.json();
          // Sort trainings, maybe by date or status?
          const sortedData = data.sort((a, b) => new Date(b.enviado_em) - new Date(a.enviado_em)); // Example: newest first
          setTrainings(sortedData);
          // Select the first active training if available, otherwise the first one
          const activeTraining = sortedData.find(t => t.ativo);
          setSelectedTraining(activeTraining || sortedData[0] || null);
        } else {
          console.error('Erro ao buscar treinos:', response.status, response.statusText);
          setError(`Falha ao buscar treinos (${response.status}). Tente novamente mais tarde.`);
          setTrainings([]); // Clear trainings on error
        }
      } catch (err) {
        console.error('Erro na requisição de treinos:', err);
        setError('Ocorreu um erro de rede ao buscar seus treinos.');
        setTrainings([]); // Clear trainings on network error
      } finally {
        setDataLoading(false); // Finish data loading
      }
    };

    // Only fetch if auth is done, user is logged in, and session is available
    if (!authLoading && user && session) {
      fetchTrainings();
    } else if (!authLoading && !user) {
      // If auth is done and no user, stop loading and clear data
      setDataLoading(false);
      setTrainings([]);
      setSelectedTraining(null);
      setError(null); // Clear errors if logged out
    }
    // Dependencies: authLoading, user, session
  }, [authLoading, user, session]);

  const handleTrainingSelect = (training) => {
    setSelectedTraining(training);
    setShowPdfViewer(false); // Close PDF viewer when selecting a new training
  };

  const handleViewPdf = () => {
    if (selectedTraining?.url_pdf) {
        setShowPdfViewer(true);
    } else {
        alert('URL do PDF não disponível para este treino.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    try {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return 'Data inválida';
    }
  };

  const getTrainingTypeLabel = (type) => {
    const types = {
      forca: 'Força',
      cardio: 'Cardio',
      funcional: 'Funcional',
      hiit: 'HIIT',
      yoga: 'Yoga',
      personalizado: 'Personalizado',
      adaptacao: 'Adaptação',
      resistencia: 'Resistência',
      mobilidade: 'Mobilidade',
      // Add other types as needed
    };
    return types[type] || type || 'Não especificado'; // Return the key if not found, or default
  };

  // ---- Conditional Rendering ----

  // 1. Show loading indicator while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Carregando...</p>
      </div>
    );
  }

  // 2. Show message if user is not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <h2 className="text-xl font-semibold text-gray-700">Acesso Restrito</h2>
        <p className="text-gray-500 mt-2">Por favor, faça login para visualizar seus planos de treino.</p>
      </div>
    );
  }

  // 3. Show data loading indicator
  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Buscando seus treinos...</p>
      </div>
    );
  }

  // 4. Show error message if fetching failed
  if (error) {
      return (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md my-4">
              <div className="flex">
                  <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                  </div>
              </div>
          </div>
      );
  }

  // 5. Show main content (training list and details)
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">Meus Treinos</h1>
        <div className="text-sm text-gray-500">
          {trainings.length} treino{trainings.length !== 1 ? 's' : ''} disponível{trainings.length !== 1 ? 'is' : ''}
        </div>
      </div>

      {trainings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training List */} 
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Treinos Disponíveis</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto"> {/* Added max-height and scroll */}
                {trainings.map((training) => (
                  <div
                    key={training.id}
                    onClick={() => handleTrainingSelect(training)}
                    className={`p-4 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100 ${
                      selectedTraining?.id === training.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-2"> {/* Added min-w-0 for truncation */}
                        <h4 className="font-medium text-gray-900 truncate">
                          {training.nome_arquivo?.replace(/\.pdf$/i, '') || 'Treino sem nome'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(training.enviado_em)}
                        </p>
                        {training.tipo_treino && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                            {getTrainingTypeLabel(training.tipo_treino)}
                          </span>
                        )}
                      </div>
                      {training.ativo && (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Training Details */} 
          <div className="lg:col-span-2">
            {selectedTraining ? (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                {/* Header */} 
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-3 sm:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedTraining.nome_arquivo?.replace(/\.pdf$/i, '') || 'Detalhes do Treino'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Enviado em: {formatDate(selectedTraining.enviado_em)}
                      </p>
                    </div>
                    {selectedTraining.url_pdf && (
                        <button
                            onClick={handleViewPdf}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                            <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            Visualizar PDF
                        </button>
                    )}
                  </div>
                </div>

                {/* Body Content */} 
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Training Info */} 
                    <div>
                      <h4 className="text-base font-medium text-gray-700 mb-3">Informações</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedTraining.tipo_treino ? getTrainingTypeLabel(selectedTraining.tipo_treino) : 'Não especificado'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Duração Estimada</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedTraining.duracao_semanas ? `${selectedTraining.duracao_semanas} semana${selectedTraining.duracao_semanas > 1 ? 's' : ''}` : 'Não especificada'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm">
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

                    {/* Description/Notes */} 
                    <div>
                      <h4 className="text-base font-medium text-gray-700 mb-3">Detalhes Adicionais</h4>
                      {selectedTraining.descricao && (
                        <div className="mb-3">
                          <dt className="text-sm font-medium text-gray-500 mb-1">Descrição</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTraining.descricao}</dd>
                        </div>
                      )}
                      {selectedTraining.observacoes && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 mb-1">Observações</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTraining.observacoes}</dd>
                        </div>
                      )}
                      {!selectedTraining.descricao && !selectedTraining.observacoes && (
                        <p className="text-sm text-gray-500 italic">Nenhuma descrição ou observação adicional fornecida.</p>
                      )}
                    </div>
                  </div>

                  {/* PDF Viewer Area */} 
                  {showPdfViewer && selectedTraining.url_pdf && (
                    <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden shadow-inner">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-800">Visualização: {selectedTraining.nome_arquivo?.replace(/\.pdf$/i, '')}</h5>
                        <div className="flex items-center space-x-3">
                           <a
                            href={selectedTraining.url_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Baixar PDF"
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          </a>
                          <button
                            onClick={() => setShowPdfViewer(false)}
                            title="Fechar Visualizador"
                            className="text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                      {/* Embed PDF - Consider using a library like react-pdf for better control if needed */}
                      <div className="h-[70vh] bg-gray-200 flex items-center justify-center">
                        <iframe
                          src={`${selectedTraining.url_pdf}#view=fitH`}
                          className="w-full h-full border-0"
                          title={`Visualizador de PDF - ${selectedTraining.nome_arquivo}`}
                          onError={(e) => console.error('Erro ao carregar PDF no iframe:', e)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Placeholder when no training is selected
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-gray-500 text-center">
                  Selecione um treino da lista à esquerda para ver os detalhes.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Message when no trainings are available
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <svg className="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum Treino Encontrado</h3>
          <p className="text-gray-600 mb-6">
            Parece que você ainda não tem nenhum plano de treino ativo. Fale com seu instrutor ou com o suporte.
          </p>
          {/* Optional: Add a contact button or link */}
          {/* <button className="...">Entrar em Contato</button> */}
        </div>
      )}
    </div>
  );
};

export default TrainingPlan;

