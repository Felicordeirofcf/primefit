import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { trainingsAPI, assessmentsAPI, progressAPI } from '../../api/apiClient';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar } from '../../components/ui/calendar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Activity, Calendar as CalendarIcon, Dumbbell, LineChart as LineChartIcon,
  User, Users, MessageSquare, Award, TrendingUp
} from 'lucide-react';

// Dados mock para quando a API não estiver disponível
const mockData = {
  trainings: [
    { id: '1', title: 'Treino A - Peito e Tríceps', type: 'strength', created_at: '2025-06-01T10:00:00Z' },
    { id: '2', title: 'Treino B - Costas e Bíceps', type: 'strength', created_at: '2025-06-02T10:00:00Z' },
    { id: '3', title: 'Treino C - Pernas', type: 'strength', created_at: '2025-06-03T10:00:00Z' },
    { id: '4', title: 'Cardio - HIIT', type: 'cardio', created_at: '2025-06-04T10:00:00Z' },
  ],
  assessments: [
    { 
      id: '1', 
      type: 'initial', 
      date: '2025-05-01T10:00:00Z',
      measurements: { weight: 80, body_fat: 20, muscle_mass: 35 }
    },
    { 
      id: '2', 
      type: 'progress', 
      date: '2025-06-01T10:00:00Z',
      measurements: { weight: 78, body_fat: 18, muscle_mass: 36 }
    },
  ],
  progress: [
    { id: '1', date: '2025-05-01T10:00:00Z', weight: 80 },
    { id: '2', date: '2025-05-08T10:00:00Z', weight: 79.5 },
    { id: '3', date: '2025-05-15T10:00:00Z', weight: 79 },
    { id: '4', date: '2025-05-22T10:00:00Z', weight: 78.5 },
    { id: '5', date: '2025-06-01T10:00:00Z', weight: 78 },
  ],
  stats: {
    totalWorkouts: 24,
    totalMinutes: 1440,
    caloriesBurned: 12500,
    weightLoss: 2,
    muscleGain: 1,
    streakDays: 15
  }
};

// Cores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardHome = () => {
  const { userProfile, isAuthenticated, loading } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    caloriesBurned: 0,
    weightLoss: 0,
    muscleGain: 0,
    streakDays: 0
  });
  const [date, setDate] = useState(new Date());
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Função para carregar dados do usuário
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setDataLoading(true);
    
    try {
      // Carregar treinos
      const { data: trainingsData, error: trainingsError } = await trainingsAPI.getMyTrainings();
      if (trainingsError) {
        console.error('Erro ao carregar treinos:', trainingsError);
        setTrainings(mockData.trainings);
      } else {
        setTrainings(trainingsData || []);
      }
      
      // Carregar avaliações
      const { data: assessmentsData, error: assessmentsError } = await assessmentsAPI.getMyAssessments();
      if (assessmentsError) {
        console.error('Erro ao carregar avaliações:', assessmentsError);
        setAssessments(mockData.assessments);
      } else {
        setAssessments(assessmentsData || []);
      }
      
      // Carregar progresso
      const { data: progressData, error: progressError } = await progressAPI.getMyProgress();
      if (progressError) {
        console.error('Erro ao carregar progresso:', progressError);
        setProgress(mockData.progress);
      } else {
        setProgress(progressData || []);
      }
      
      // Calcular estatísticas
      calculateStats(
        trainingsData || mockData.trainings, 
        assessmentsData || mockData.assessments, 
        progressData || mockData.progress
      );
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Usar dados mock em caso de erro
      setTrainings(mockData.trainings);
      setAssessments(mockData.assessments);
      setProgress(mockData.progress);
      setStats(mockData.stats);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  // Calcular estatísticas com base nos dados
  const calculateStats = (trainings, assessments, progress) => {
    try {
      // Se não houver dados suficientes, usar dados mock
      if (!trainings.length || !assessments.length || !progress.length) {
        setStats(mockData.stats);
        return;
      }
      
      // Calcular estatísticas reais
      const totalWorkouts = trainings.length;
      const totalMinutes = trainings.length * 60; // Estimativa de 60 minutos por treino
      const caloriesBurned = totalMinutes * 8; // Estimativa de 8 calorias por minuto
      
      // Calcular perda de peso e ganho de massa muscular
      let weightLoss = 0;
      let muscleGain = 0;
      
      if (assessments.length >= 2) {
        // Ordenar avaliações por data
        const sortedAssessments = [...assessments].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        const firstAssessment = sortedAssessments[0];
        const lastAssessment = sortedAssessments[sortedAssessments.length - 1];
        
        // Calcular diferenças
        weightLoss = firstAssessment.measurements.weight - lastAssessment.measurements.weight;
        muscleGain = lastAssessment.measurements.muscle_mass - firstAssessment.measurements.muscle_mass;
      }
      
      // Calcular dias de sequência
      const streakDays = 15; // Valor fixo para demonstração
      
      setStats({
        totalWorkouts,
        totalMinutes,
        caloriesBurned,
        weightLoss: weightLoss > 0 ? weightLoss : 0,
        muscleGain: muscleGain > 0 ? muscleGain : 0,
        streakDays
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      setStats(mockData.stats);
    }
  };

  // Carregar dados quando o componente montar ou o usuário mudar
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Preparar dados para o gráfico de progresso
  const prepareProgressData = () => {
    if (!progress.length) return [];
    
    return progress.map(entry => ({
      date: format(new Date(entry.date), 'dd/MM'),
      peso: entry.weight
    }));
  };

  // Preparar dados para o gráfico de composição corporal
  const prepareBodyCompositionData = () => {
    if (!assessments.length) return [];
    
    const latestAssessment = assessments.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )[0];
    
    return [
      { name: 'Gordura', value: latestAssessment.measurements.body_fat },
      { name: 'Músculo', value: latestAssessment.measurements.muscle_mass },
      { name: 'Outros', value: 100 - latestAssessment.measurements.body_fat - latestAssessment.measurements.muscle_mass }
    ];
  };

  // Renderizar conteúdo com base no estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="mb-4">Você precisa estar logado para acessar esta página.</p>
          <Button asChild>
            <a href="/login">Fazer Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Olá, {userProfile?.nome || 'Usuário'}!
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Treinos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalWorkouts}</div>
                <p className="text-sm text-muted-foreground">treinos realizados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalMinutes}</div>
                <p className="text-sm text-muted-foreground">minutos de treino</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Calorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.caloriesBurned}</div>
                <p className="text-sm text-muted-foreground">calorias queimadas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Sequência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.streakDays}</div>
                <p className="text-sm text-muted-foreground">dias consecutivos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <LineChartIcon className="mr-2 h-5 w-5" />
                  Perda de Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.weightLoss} kg</div>
                <p className="text-sm text-muted-foreground">desde o início</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Ganho Muscular
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.muscleGain} kg</div>
                <p className="text-sm text-muted-foreground">desde o início</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Progresso de Peso</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Composição Corporal</CardTitle>
                <CardDescription>Última avaliação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareBodyCompositionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareBodyCompositionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximos Treinos</CardTitle>
              <CardDescription>Seus treinos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainings.slice(0, 3).map((training) => (
                  <div key={training.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h3 className="font-medium">{training.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(training.created_at), 'PPP', { locale: ptBR })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Ver Todos os Treinos</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Progresso */}
        <TabsContent value="progress">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Progresso de Peso</CardTitle>
                <CardDescription>Acompanhamento ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Composição Corporal</CardTitle>
                <CardDescription>Evolução da composição corporal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assessments.map(a => ({
                      data: format(new Date(a.date), 'dd/MM'),
                      'Gordura (%)': a.measurements.body_fat,
                      'Músculo (kg)': a.measurements.muscle_mass
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Gordura (%)" fill="#FF8042" />
                      <Bar dataKey="Músculo (kg)" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Objetivo</CardTitle>
                <CardDescription>Progresso em relação ao seu objetivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Perda de Peso</span>
                      <span>{stats.weightLoss} kg / 5 kg</span>
                    </div>
                    <Progress value={stats.weightLoss * 20} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Ganho Muscular</span>
                      <span>{stats.muscleGain} kg / 3 kg</span>
                    </div>
                    <Progress value={stats.muscleGain * 33.33} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Treinos Realizados</span>
                      <span>{stats.totalWorkouts} / 30</span>
                    </div>
                    <Progress value={(stats.totalWorkouts / 30) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Calendário */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Treinos</CardTitle>
              <CardDescription>Visualize seus treinos agendados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    locale={ptBR}
                  />
                </div>
                <div className="md:w-1/2">
                  <h3 className="font-medium text-lg mb-4">
                    {format(date, 'PPP', { locale: ptBR })}
                  </h3>
                  <div className="space-y-4">
                    {trainings
                      .filter(t => {
                        const trainingDate = new Date(t.created_at);
                        return (
                          trainingDate.getDate() === date.getDate() &&
                          trainingDate.getMonth() === date.getMonth() &&
                          trainingDate.getFullYear() === date.getFullYear()
                        );
                      })
                      .map((training) => (
                        <div key={training.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h3 className="font-medium">{training.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {training.type === 'strength' ? 'Força' : 
                               training.type === 'cardio' ? 'Cardio' : 
                               training.type === 'flexibility' ? 'Flexibilidade' : 
                               training.type}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">Ver</Button>
                        </div>
                      ))}
                    {trainings.filter(t => {
                      const trainingDate = new Date(t.created_at);
                      return (
                        trainingDate.getDate() === date.getDate() &&
                        trainingDate.getMonth() === date.getMonth() &&
                        trainingDate.getFullYear() === date.getFullYear()
                      );
                    }).length === 0 && (
                      <p className="text-muted-foreground">Nenhum treino agendado para esta data.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;

