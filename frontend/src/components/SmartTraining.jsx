import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

const SmartTraining = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [alternatives, setAlternatives] = useState([]);

  // Estado para geração de plano
  const [planForm, setPlanForm] = useState({
    objetivo: '',
    nivel: '',
    dias_disponiveis: 3,
    tempo_por_sessao: '',
    equipamentos: '',
    restricoes: ''
  });

  // Estado para feedback de desempenho
  const [performanceForm, setPerformanceForm] = useState({
    historico_exercicio: '',
    feedback_usuario: ''
  });

  // Estado para exercícios alternativos
  const [alternativeForm, setAlternativeForm] = useState({
    exercicio_original: '',
    motivo: '',
    equipamentos: ''
  });

  const generateTrainingPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/training/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planForm),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTrainingPlan(data.training_plan);
      } else {
        throw new Error('Erro ao gerar plano');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar plano de treino. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/training/performance-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceForm),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setFeedback(data.feedback);
      } else {
        throw new Error('Erro ao obter feedback');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao obter feedback. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAlternativeExercises = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/training/alternative-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alternativeForm),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setAlternatives(data.alternatives.split('\n').filter(alt => alt.trim()));
      } else {
        throw new Error('Erro ao obter alternativas');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao obter exercícios alternativos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrainingPlan = () => {
    if (!trainingPlan || !Array.isArray(trainingPlan)) return null;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Calendar className="mr-2" size={20} />
          Seu Plano de Treino Personalizado
        </h3>
        
        {trainingPlan.map((day, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{day.dia}</h4>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {day.foco}
              </span>
            </div>
            
            <div className="space-y-3">
              {day.exercicios && day.exercicios.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Dumbbell className="mr-3 text-blue-600" size={16} />
                    <span className="font-medium text-gray-800">{exercise.nome}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exercise.series} séries × {exercise.repeticoes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Treinos Inteligentes</h1>
        <p className="text-blue-100">
          Planos personalizados, feedback em tempo real e exercícios adaptativos com IA
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'generate', label: 'Gerar Plano', icon: Target },
          { id: 'feedback', label: 'Análise de Desempenho', icon: TrendingUp },
          { id: 'alternatives', label: 'Exercícios Alternativos', icon: RefreshCw }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="mr-2" size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'generate' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gerar Plano de Treino Personalizado</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo Principal
                </label>
                <select
                  value={planForm.objetivo}
                  onChange={(e) => setPlanForm({...planForm, objetivo: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione seu objetivo</option>
                  <option value="perder peso">Perder Peso</option>
                  <option value="ganhar massa">Ganhar Massa Muscular</option>
                  <option value="tonificar">Tonificar</option>
                  <option value="condicionamento">Melhorar Condicionamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Experiência
                </label>
                <select
                  value={planForm.nivel}
                  onChange={(e) => setPlanForm({...planForm, nivel: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione seu nível</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias por Semana
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={planForm.dias_disponiveis}
                  onChange={(e) => setPlanForm({...planForm, dias_disponiveis: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo por Sessão
                </label>
                <select
                  value={planForm.tempo_por_sessao}
                  onChange={(e) => setPlanForm({...planForm, tempo_por_sessao: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o tempo</option>
                  <option value="30 minutos">30 minutos</option>
                  <option value="45 minutos">45 minutos</option>
                  <option value="60 minutos">60 minutos</option>
                  <option value="90 minutos">90 minutos</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipamentos Disponíveis
                </label>
                <textarea
                  value={planForm.equipamentos}
                  onChange={(e) => setPlanForm({...planForm, equipamentos: e.target.value})}
                  placeholder="Ex: halteres, barra, esteira, peso corporal..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restrições ou Lesões (opcional)
                </label>
                <textarea
                  value={planForm.restricoes}
                  onChange={(e) => setPlanForm({...planForm, restricoes: e.target.value})}
                  placeholder="Descreva qualquer lesão ou restrição..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <button
              onClick={generateTrainingPlan}
              disabled={isLoading || !planForm.objetivo || !planForm.nivel || !planForm.tempo_por_sessao}
              className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={18} />
                  Gerando Plano...
                </>
              ) : (
                <>
                  <Target className="mr-2" size={18} />
                  Gerar Plano de Treino
                </>
              )}
            </button>

            {renderTrainingPlan()}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise de Desempenho</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Histórico do Exercício
                </label>
                <textarea
                  value={performanceForm.historico_exercicio}
                  onChange={(e) => setPerformanceForm({...performanceForm, historico_exercicio: e.target.value})}
                  placeholder="Ex: Flexão de braço - Semana 1: 3x8, Semana 2: 3x10, Semana 3: 3x12..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Feedback
                </label>
                <textarea
                  value={performanceForm.feedback_usuario}
                  onChange={(e) => setPerformanceForm({...performanceForm, feedback_usuario: e.target.value})}
                  placeholder="Como você se sentiu durante o treino? Alguma dificuldade ou observação?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <button
                onClick={getPerformanceFeedback}
                disabled={isLoading || !performanceForm.historico_exercicio || !performanceForm.feedback_usuario}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={18} />
                    Analisando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2" size={18} />
                    Obter Análise
                  </>
                )}
              </button>

              {feedback && (
                <div className="mt-6 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="mr-3 text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Análise do seu Desempenho</h3>
                      <p className="text-green-700 whitespace-pre-line">{feedback}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Exercícios Alternativos</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercício a ser Substituído
                </label>
                <input
                  type="text"
                  value={alternativeForm.exercicio_original}
                  onChange={(e) => setAlternativeForm({...alternativeForm, exercicio_original: e.target.value})}
                  placeholder="Ex: Agachamento com barra"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Substituição
                </label>
                <textarea
                  value={alternativeForm.motivo}
                  onChange={(e) => setAlternativeForm({...alternativeForm, motivo: e.target.value})}
                  placeholder="Ex: Dor no joelho, não tenho equipamento, muito difícil..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipamentos Disponíveis
                </label>
                <textarea
                  value={alternativeForm.equipamentos}
                  onChange={(e) => setAlternativeForm({...alternativeForm, equipamentos: e.target.value})}
                  placeholder="Ex: halteres, peso corporal, elásticos..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <button
                onClick={getAlternativeExercises}
                disabled={isLoading || !alternativeForm.exercicio_original || !alternativeForm.motivo}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={18} />
                    Buscando Alternativas...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={18} />
                    Buscar Alternativas
                  </>
                )}
              </button>

              {alternatives.length > 0 && (
                <div className="mt-6 p-6 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                  <div className="flex items-start">
                    <Star className="mr-3 text-purple-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">Exercícios Alternativos Sugeridos</h3>
                      <ul className="space-y-2">
                        {alternatives.map((alternative, index) => (
                          <li key={index} className="flex items-center text-purple-700">
                            <Dumbbell className="mr-2 flex-shrink-0" size={16} />
                            {alternative}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartTraining;

