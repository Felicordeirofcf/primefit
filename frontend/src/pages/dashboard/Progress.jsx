import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth provides user and loading state
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Ensure Filler is registered if used here, seems it is used
} from 'chart.js';

// Register Chart.js components (ensure Filler is included if needed by charts here)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Added Filler here as charts use fill: true
);

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

const Progress = () => {
  // Use auth hook to get user and loading status
  const { user, loading: authLoading, session } = useAuth(); // Assuming session is available for token check

  // Component-specific loading state for data fetching
  const [dataLoading, setDataLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
  });

  // Effect to fetch data when authentication is confirmed and user exists
  useEffect(() => {
    // Only fetch data if auth is not loading and user is logged in
    if (!authLoading && user && session) { // Check for session as well
      setDataLoading(true); // Start data loading
      fetchProgressData();
      fetchProgressSummary();
    } else if (!authLoading && !user) {
      // If auth is done and user is not logged in, stop loading
      setDataLoading(false);
      setProgressData([]); // Clear any previous data
      setSummary(null);
    }
    // Dependencies: authLoading, user, session
  }, [authLoading, user, session]);

  const getToken = () => {
    // Prefer getting token from the session object if available
    if (session?.access_token) {
        return session.access_token;
    }
    // Fallback to localStorage/sessionStorage (less ideal)
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

  const fetchProgressData = async () => {
    const token = getToken();
    if (!token) {
      console.error('Token não encontrado para buscar dados de progresso.');
      setDataLoading(false); // Stop loading if no token
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await fetch(`${API_URL}/api/progress/`, config);

      if (response.ok) {
        const data = await response.json();
        // Sort data by date ascending for charts
        const sortedData = data.sort((a, b) => new Date(a.data_medicao) - new Date(b.data_medicao));
        setProgressData(sortedData);
      } else {
        console.error('Erro ao buscar dados de progresso:', response.statusText);
        // Handle error, maybe show a message to the user
        setProgressData([]); // Clear data on error
      }
    } catch (error) {
      console.error('Erro na requisição de progresso:', error);
      setProgressData([]); // Clear data on error
    } finally {
      // Only set loading false if summary is also fetched or fails
      // setDataLoading(false); // Moved to fetchProgressSummary finally block
    }
  };

  const fetchProgressSummary = async () => {
    const token = getToken();
    if (!token) {
      console.error('Token não encontrado para buscar resumo de progresso.');
      setDataLoading(false); // Stop loading if no token
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await fetch(`${API_URL}/api/progress/stats/summary`, config);

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        console.error('Erro ao buscar resumo de progresso:', response.statusText);
        setSummary(null); // Clear summary on error
      }
    } catch (error) {
      console.error('Erro na requisição de resumo de progresso:', error);
      setSummary(null); // Clear summary on error
    } finally {
      setDataLoading(false); // Set loading false after both fetches attempt
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!token) {
      alert('Erro: Você precisa estar logado para registrar progresso.');
      console.error('Token não encontrado ao tentar registrar progresso.');
      return;
    }

    // Prepare data, converting empty strings to null and numbers
    const submitData = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] === null || formData[key] === '') {
        submitData[key] = null;
      } else if (key === 'data_medicao' || key === 'observacoes') {
        submitData[key] = formData[key];
      } else {
        // Try parsing as float, default to null if invalid
        const parsedValue = parseFloat(formData[key]);
        submitData[key] = isNaN(parsedValue) ? null : parsedValue;
      }
    });

    // Basic validation (example: weight must be positive)
    if (submitData.peso !== null && submitData.peso <= 0) {
        alert('O peso deve ser um valor positivo.');
        return;
    }
    // Add more validation as needed

    try {
      const response = await fetch(`${API_URL}/api/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert('Progresso registrado com sucesso!');
        setShowAddForm(false);
        // Reset form
        setFormData({
          peso: '', percentual_gordura: '', massa_muscular: '', circunferencia_cintura: '',
          circunferencia_quadril: '', circunferencia_braco: '', circunferencia_coxa: '',
          pressao_arterial_sistolica: '', pressao_arterial_diastolica: '',
          frequencia_cardiaca_repouso: '', observacoes: '',
          data_medicao: new Date().toISOString().split('T')[0]
        });
        // Refetch data
        setDataLoading(true);
        fetchProgressData();
        fetchProgressSummary();
      } else {
        const errorData = await response.json();
        console.error('Erro ao registrar progresso - Resposta API:', errorData);
        alert(`Erro ao registrar progresso: ${errorData.detail || response.statusText || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição para registrar progresso:', error);
      alert('Erro ao conectar com o servidor para registrar progresso.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Chart configurations (using sorted progressData)
  const createChartConfig = (label, dataKey, color, unit = '') => ({
    labels: progressData.map(data => new Date(data.data_medicao).toLocaleDateString('pt-BR')),
    datasets: [{
      label: `${label} (${unit})`,
      data: progressData.map(data => data[dataKey]).filter(v => v !== null), // Filter null values for chart
      borderColor: color,
      backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
      tension: 0.3,
      fill: true,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: '#fff',
    }]
  });

  const weightChartData = createChartConfig('Peso', 'peso', 'rgb(59, 130, 246)', 'kg');
  const bodyFatChartData = createChartConfig('Gordura Corporal', 'percentual_gordura', 'rgb(239, 68, 68)', '%');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
              label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                      label += ': ';
                  }
                  if (context.parsed.y !== null) {
                      label += context.parsed.y;
                      // Add unit back based on label
                      if (context.dataset.label.includes('(kg)')) label += ' kg';
                      if (context.dataset.label.includes('(%)')) label += ' %';
                  }
                  return label;
              }
          }
      }
    },
    scales: {
      x: {
          ticks: {
              maxTicksLimit: 10, // Adjust based on expected data points
              autoSkip: true,
          }
      },
      y: {
        beginAtZero: false,
        ticks: {
            // Dynamically add unit to y-axis ticks if needed
            callback: function(value, index, values) {
                // Example: Add 'kg' if it's the weight chart
                // This requires knowing which chart it is, might need separate options
                return value;
            }
        }
      }
    },
    interaction: {
        mode: 'index',
        intersect: false,
    }
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
              <p className="text-gray-500 mt-2">Por favor, faça login para acessar seu progresso.</p>
              {/* Optionally add a login button/link here */}
          </div>
      );
  }

  // 3. Show data loading indicator or main content
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">Meu Progresso</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Registrar Progresso
        </button>
      </div>

      {dataLoading ? (
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Carregando dados de progresso...</p>
          </div>
      ) : (
        <>
          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Cards - Reusing StatCard component if available or inline */}
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500 uppercase">Medições</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{summary.total_medicoes}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500 uppercase">Peso Atual</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{summary.peso_atual ? `${summary.peso_atual.toFixed(1)}kg` : 'N/A'}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500 uppercase">Gordura Atual</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{summary.gordura_atual ? `${summary.gordura_atual.toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-500 uppercase">Evolução Peso</p>
                <p className={`mt-1 text-3xl font-semibold ${summary.evolucao_peso > 0 ? 'text-red-600' : summary.evolucao_peso < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {summary.evolucao_peso !== null ? `${summary.evolucao_peso > 0 ? '+' : ''}${summary.evolucao_peso.toFixed(1)}kg` : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          {progressData.length > 1 ? ( // Only show charts if there's enough data
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolução do Peso (kg)</h3>
                <div className="h-72 relative">
                  <Line data={weightChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Percentual de Gordura Corporal (%)</h3>
                <div className="h-72 relative">
                  <Line data={bodyFatChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          ) : progressData.length === 1 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md my-4">
                  <p className="text-sm text-yellow-700">Registre mais medições para visualizar gráficos de evolução.</p>
              </div>
          ) : null}

          {/* History Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Histórico de Medições</h3>
            </div>
            {progressData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* Simplified headers */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gordura (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M. Muscular (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cintura (cm)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Display data in reverse chronological order (newest first) */}
                    {[...progressData].reverse().map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(entry.data_medicao).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.peso?.toFixed(1) ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.percentual_gordura?.toFixed(1) ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.massa_muscular?.toFixed(1) ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.circunferencia_cintura?.toFixed(1) ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={entry.observacoes}>{entry.observacoes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Nenhum registro de progresso encontrado.
                <p className="text-sm text-gray-400 mt-1">Clique em "Registrar Progresso" para adicionar sua primeira medição.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Progress Modal */} 
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out" /* Added transition */>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-enter">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-xl font-semibold text-gray-800">Registrar Nova Medição</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="Fechar modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Required fields first */}
                <div>
                  <label htmlFor="data_medicao" className="block text-sm font-medium text-gray-700 mb-1">Data da Medição *</label>
                  <input
                    type="date"
                    id="data_medicao"
                    name="data_medicao"
                    value={formData.data_medicao}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    id="peso"
                    name="peso"
                    placeholder="Ex: 75.5"
                    value={formData.peso}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {/* Optional fields */}
                <div>
                  <label htmlFor="percentual_gordura" className="block text-sm font-medium text-gray-700 mb-1">Gordura Corporal (%)</label>
                  <input type="number" step="0.1" id="percentual_gordura" name="percentual_gordura" placeholder="Ex: 18.2" value={formData.percentual_gordura} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="massa_muscular" className="block text-sm font-medium text-gray-700 mb-1">Massa Muscular (kg)</label>
                  <input type="number" step="0.1" id="massa_muscular" name="massa_muscular" placeholder="Ex: 35.0" value={formData.massa_muscular} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="circunferencia_cintura" className="block text-sm font-medium text-gray-700 mb-1">Cintura (cm)</label>
                  <input type="number" step="0.1" id="circunferencia_cintura" name="circunferencia_cintura" placeholder="Ex: 85" value={formData.circunferencia_cintura} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                  <label htmlFor="circunferencia_quadril" className="block text-sm font-medium text-gray-700 mb-1">Quadril (cm)</label>
                  <input type="number" step="0.1" id="circunferencia_quadril" name="circunferencia_quadril" placeholder="Ex: 100" value={formData.circunferencia_quadril} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                  <label htmlFor="circunferencia_braco" className="block text-sm font-medium text-gray-700 mb-1">Braço (cm)</label>
                  <input type="number" step="0.1" id="circunferencia_braco" name="circunferencia_braco" placeholder="Ex: 30" value={formData.circunferencia_braco} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                  <label htmlFor="circunferencia_coxa" className="block text-sm font-medium text-gray-700 mb-1">Coxa (cm)</label>
                  <input type="number" step="0.1" id="circunferencia_coxa" name="circunferencia_coxa" placeholder="Ex: 55" value={formData.circunferencia_coxa} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                  <label htmlFor="pressao_arterial_sistolica" className="block text-sm font-medium text-gray-700 mb-1">Pressão Sistólica (mmHg)</label>
                  <input type="number" id="pressao_arterial_sistolica" name="pressao_arterial_sistolica" placeholder="Ex: 120" value={formData.pressao_arterial_sistolica} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                  <label htmlFor="pressao_arterial_diastolica" className="block text-sm font-medium text-gray-700 mb-1">Pressão Diastólica (mmHg)</label>
                  <input type="number" id="pressao_arterial_diastolica" name="pressao_arterial_diastolica" placeholder="Ex: 80" value={formData.pressao_arterial_diastolica} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                  <label htmlFor="frequencia_cardiaca_repouso" className="block text-sm font-medium text-gray-700 mb-1">Freq. Cardíaca Repouso (bpm)</label>
                  <input type="number" id="frequencia_cardiaca_repouso" name="frequencia_cardiaca_repouso" placeholder="Ex: 65" value={formData.frequencia_cardiaca_repouso} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              {/* Observations Textarea */}
              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows="3"
                  placeholder="Alguma nota sobre como se sentiu, dieta, etc."
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="pt-5 border-t border-gray-200 mt-5">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium"
                  >
                    Salvar Registro
                  </button>
                </div>
              </div>
            </form>
          </div>
           {/* Add CSS for modal animation */}
           <style>{`
              @keyframes modal-enter {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-modal-enter { animation: modal-enter 0.3s ease-out forwards; }
            `}</style>
        </div>
      )}
    </div>
  );
};

export default Progress;

