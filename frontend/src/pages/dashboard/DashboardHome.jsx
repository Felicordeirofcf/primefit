import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Confirme se este é o caminho correto para seu hook
import { supabase } from '../../supabaseClient'; // <<< ADICIONE ESTA LINHA (ajuste o caminho se necessário)
import axios from 'axios';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2'; // Removido 'Bar' se não estiver usando
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  // BarElement, // Removido se não estiver usando gráfico de barras aqui
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  // BarElement, // Removido se não estiver usando gráfico de barras aqui
  Title,
  Tooltip,
  Legend
);

// URL base da API (Vite espera variáveis de ambiente com prefixo VITE_)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardHome = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [stats, setStats] = useState({
    weightData: [],
    completedWorkouts: 0,
    upcomingWorkouts: [], // Certifique-se de popular isso se necessário
    latestAssessment: null,
    weightChange: null,
    weightChangePercentage: null
  });
  
  useEffect(() => {
    // Só busca dados quando a autenticação estiver completa e o usuário existir
    if (isAuthLoading || !user) {
      // Opcional: Limpar dados se o usuário deslogar ou a autenticação mudar
      // setStats({ /* estado inicial ou vazio */ });
      return;
    }
    
    const fetchDashboardData = async () => {
      setIsDataLoading(true);
      
      // 1. Obter o token de acesso da sessão atual do Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.access_token) {
        console.error('Erro ao obter sessão ou token não encontrado:', sessionError?.message || 'Sessão não disponível');
        toast.error('Sua sessão é inválida ou expirou. Por favor, faça login novamente.');
        setIsDataLoading(false);
        // Considere redirecionar para login ou chamar uma função de logout do AuthContext
        // Ex: window.location.href = '/login';
        return;
      }
      
      const supabaseAccessToken = session.access_token;
      
      try {
        const config = {
          headers: {
            // 2. Usar o token de acesso do Supabase
            Authorization: `Bearer ${supabaseAccessToken}`
          }
        };
        
        // Busca avaliações físicas
        const assessmentsResponse = await axios.get(`${API_URL}/assessments`, config);
        const assessments = assessmentsResponse.data || [];
        
        // Busca registros de treinos
        const trainingLogsResponse = await axios.get(`${API_URL}/trainings/logs`, config);
        const trainingLogs = trainingLogsResponse.data || [];
        
        // Busca planos de treino (não usado diretamente no estado, mas pode ser para upcomingWorkouts)
        // const trainingPlansResponse = await axios.get(`${API_URL}/trainings/plans`, config);
        // const trainingPlans = trainingPlansResponse.data || [];
        
        // Processa os dados para o dashboard
        // Ordena as avaliações pela data mais recente primeiro
        const sortedAssessments = [...assessments].sort((a,b) => new Date(b.date) - new Date(a.date));

        const weightDataForChart = [...sortedAssessments].map(assessment => ({
          date: new Date(assessment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          weight: assessment.weight
        })).reverse(); // .reverse() para o gráfico ter a progressão temporal correta (mais antigo para mais novo)
        
        const completedWorkouts = trainingLogs.filter(log => log.completed).length;
        
        let weightChange = null;
        let weightChangePercentage = null;
        
        if (sortedAssessments.length >= 2) {
          const latestWeight = sortedAssessments[0].weight; // Mais recente
          const previousWeight = sortedAssessments[1].weight; // Segunda mais recente
          if (typeof latestWeight === 'number' && typeof previousWeight === 'number' && previousWeight !== 0) {
            weightChange = latestWeight - previousWeight;
            weightChangePercentage = (weightChange / previousWeight) * 100;
          }
        }
        
        setStats({
          weightData: weightDataForChart,
          completedWorkouts,
          upcomingWorkouts: [], // Implementar lógica para treinos futuros se necessário
          latestAssessment: sortedAssessments.length > 0 ? sortedAssessments[0] : null,
          weightChange,
          weightChangePercentage
        });

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          toast.error('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
          // Considere redirecionar para login ou chamar uma função de logout do AuthContext
        } else {
          toast.error('Erro ao carregar dados do dashboard.');
        }
      } finally {
        setIsDataLoading(false);
      }
    };
    
    if (user) { // Adiciona uma verificação explícita aqui também
        fetchDashboardData();
    }
  }, [user, isAuthLoading]);
  
  // Configuração do gráfico de peso
  const weightChartData = {
    labels: stats.weightData.map(data => data.date),
    datasets: [
      {
        label: 'Peso (kg)',
        data: stats.weightData.map(data => data.weight),
        borderColor: 'rgb(14, 165, 233)', // Azul
        backgroundColor: 'rgba(14, 165, 233, 0.1)', // Azul com opacidade
        fill: true,
        tension: 0.3
      }
    ]
  };
  
  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false, // O título já está no card
        // text: 'Evolução do Peso'
      }
    },
    scales: {
        y: {
            beginAtZero: false // O peso não começa em zero
        }
    }
  };
  
  if (isAuthLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen"> {/* Usar h-screen para centralizar na tela toda */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-3 mt-3 text-lg">Verificando autenticação...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen"> {/* Usar h-screen para centralizar na tela toda */}
        <p className="text-xl text-red-600 mb-4">Sessão expirada ou usuário não autenticado.</p>
        <button 
          onClick={() => window.location.href = '/login'} // Ou use o `Maps` do react-router-dom
          className="px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700 text-lg"
        >
          Fazer Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6"> {/* Adiciona padding geral */}
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1> {/* Ajuste no título */}
      
      {isDataLoading && !stats.latestAssessment ? ( // Mostrar loading principal se não houver dados ainda
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="ml-3 mt-3 text-lg">Carregando dados...</p>
        </div>
      ) : (
        <> {/* Fragmento para agrupar os elementos do dashboard */}
          {/* Resumo em cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Peso Atual</h3>
              <div className="flex items-baseline"> {/* items-baseline para alinhar texto */}
                <span className="text-4xl font-bold text-gray-800">
                  {stats.latestAssessment ? `${stats.latestAssessment.weight} kg` : 'N/A'}
                </span>
                {stats.weightChange !== null && stats.latestAssessment && (
                  <span className={`ml-2 text-sm font-semibold ${stats.weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.weightChange < 0 ? '↓' : '↑'} {Math.abs(stats.weightChange).toFixed(1)} kg 
                    {stats.weightChangePercentage !== null && ` (${Math.abs(stats.weightChangePercentage).toFixed(1)}%)`}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.latestAssessment 
                  ? `Última medição: ${new Date(stats.latestAssessment.date).toLocaleDateString('pt-BR')}`
                  : 'Nenhuma avaliação registrada'}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Treinos Concluídos</h3>
              <div className="text-4xl font-bold text-gray-800">{stats.completedWorkouts}</div>
              <p className="text-sm text-gray-500 mt-1">Total de treinos realizados</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">IMC</h3>
              <div className="text-4xl font-bold text-gray-800">
                {stats.latestAssessment && typeof stats.latestAssessment.bmi === 'number'
                  ? stats.latestAssessment.bmi.toFixed(1)
                  : 'N/A'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.latestAssessment && typeof stats.latestAssessment.bmi === 'number'
                  ? getIMCCategory(stats.latestAssessment.bmi)
                  : 'Dados insuficientes'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de evolução de peso */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Evolução do Peso</h3>
              {stats.weightData.length > 1 ? ( // Mostrar gráfico se houver pelo menos 2 pontos de dados
                <div className="h-72"> {/* Altura ajustada para o gráfico */}
                  <Line data={weightChartData} options={weightChartOptions} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-72 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-center">
                    {stats.weightData.length === 1 ? 'É necessário mais um registro de peso para exibir a evolução.' : 'Sem dados suficientes para exibir o gráfico.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Próximos treinos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Próximos Treinos</h3>
              {stats.upcomingWorkouts && stats.upcomingWorkouts.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {stats.upcomingWorkouts.map((workout, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{workout.name}</h4>
                          <p className="text-sm text-gray-500">{new Date(workout.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
                        </div>
                        <button className="btn btn-sm btn-outline-primary py-1 px-3 text-sm"> {/* Ajuste no botão */}
                          Ver Detalhes
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex justify-center items-center h-72 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum treino agendado</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Função auxiliar para determinar a categoria do IMC
const getIMCCategory = (imc) => {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
};

export default DashboardHome;