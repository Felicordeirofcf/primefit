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

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;

    setDataLoading(true);

    try {
      const { data: trainingsData, error: trainingsError } = await trainingsAPI.getMyTrainings();
      if (trainingsError) {
        console.error('Erro ao carregar treinos:', trainingsError);
        setTrainings(mockData.trainings);
      } else {
        setTrainings(trainingsData || []);
      }

      const { data: assessmentsData, error: assessmentsError } = await assessmentsAPI.getMyAssessments();
      if (assessmentsError) {
        console.error('Erro ao carregar avaliações:', assessmentsError);
        setAssessments(mockData.assessments);
      } else {
        setAssessments(assessmentsData || []);
      }

      const { data: progressData, error: progressError } = await progressAPI.getMyProgress();
      if (progressError) {
        console.error('Erro ao carregar progresso:', progressError);
        setProgress(mockData.progress);
      } else {
        setProgress(progressData || []);
      }

      calculateStats(
        trainingsData || mockData.trainings, 
        assessmentsData || mockData.assessments, 
        progressData || mockData.progress
      );
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setTrainings(mockData.trainings);
      setAssessments(mockData.assessments);
      setProgress(mockData.progress);
      setStats(mockData.stats);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  const calculateStats = (trainings, assessments, progress) => {
    try {
      if (!trainings.length || !assessments.length || !progress.length) {
        setStats(mockData.stats);
        return;
      }

      const totalWorkouts = trainings.length;
      const totalMinutes = trainings.length * 60;
      const caloriesBurned = totalMinutes * 8;

      let weightLoss = 0;
      let muscleGain = 0;

      if (assessments.length >= 2) {
        const sortedAssessments = [...assessments].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );

        const firstAssessment = sortedAssessments[0];
        const lastAssessment = sortedAssessments[sortedAssessments.length - 1];

        weightLoss = firstAssessment.measurements.weight - lastAssessment.measurements.weight;
        muscleGain = lastAssessment.measurements.muscle_mass - firstAssessment.measurements.muscle_mass;
      }

      const streakDays = 15;

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

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const prepareProgressData = () => {
    if (!progress.length) return [];

    return progress.map(entry => ({
      date: format(new Date(entry.date), 'dd/MM'),
      peso: entry.weight
    }));
  };

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
      {/* restante do JSX */}
    </div>
  );
};

export default DashboardHome;