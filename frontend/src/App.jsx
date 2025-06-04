import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Páginas públicas
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WeightLossPage from './pages/WeightLossPage';
import CompletarPerfil from './pages/CompletarPerfil';

// Páginas do dashboard
import DashboardHome from './pages/dashboard/DashboardHome';
import TrainingPlan from './pages/dashboard/TrainingPlan';
import Progress from './pages/dashboard/Progress';
import Assessments from './pages/dashboard/Assessments';
import Profile from './pages/dashboard/Profile';
import Messages from './pages/dashboard/Messages';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Componente de proteção de rotas Refinado
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('Não autenticado, redirecionando para login...');
        // Inclui search params na URL de redirecionamento
        navigate('/login?redirect=' + encodeURIComponent(location.pathname + location.search));
      } else if (isAdmin === false) { // Verifica perfil apenas se NÃO for admin
        const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);
        if (!isProfileComplete && location.pathname !== '/completar-perfil') {
          console.log('Perfil incompleto (não admin), redirecionando para completar perfil...');
          navigate('/completar-perfil');
        }
      }
      // Se isAdmin for true ou null (aguardando status), ou se perfil estiver completo, não faz nada aqui.
    }
  }, [loading, isAuthenticated, isAdmin, userProfile, navigate, location.pathname, location.search]);

  // 1. Exibe loading enquanto o estado de autenticação está sendo determinado ou status de admin está pendente
  if (loading || (isAuthenticated && isAdmin === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Usando a cor primária definida no Tailwind config (se houver) ou azul padrão */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Se não estiver autenticado após o carregamento, não renderiza nada (redirecionamento tratado no useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // 3. Se autenticado:
  //    - Admins sempre têm acesso
  //    - Não-admins precisam de perfil completo (exceto para /completar-perfil)
  if (isAdmin === true) {
    return children; // Acesso de admin garantido
  } else { // Não é admin (isAdmin === false)
    const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo);
    if (isProfileComplete || location.pathname === '/completar-perfil') {
      return children; // Perfil completo ou na página de completar perfil
    } else {
      // Perfil incompleto e não está na página de completar, não renderiza nada (redirecionamento tratado no useEffect)
      return null;
    }
  }
};

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="sobre" element={<AboutPage />} />
        <Route path="servicos" element={<ServicesPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:id" element={<BlogPostPage />} />
        <Route path="contato" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="cadastro" element={<RegisterPage />} />
        <Route path="emagrecimento" element={<WeightLossPage />} />

        {/* Rota protegida para completar perfil */}
        <Route path="completar-perfil" element={
          <ProtectedRoute>
            <CompletarPerfil />
          </ProtectedRoute>
        } />
      </Route>

      {/* Rotas do dashboard (protegidas) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="treinos" element={<TrainingPlan />} />
        <Route path="progresso" element={<Progress />} />
        <Route path="avaliacoes" element={<Assessments />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="mensagens" element={<Messages />} />
        {/* Rota Admin - O próprio componente AdminDashboard já faz a verificação interna */}
        <Route path="admin" element={<AdminDashboard />} />
      </Route>

      {/* Adicionar uma rota catch-all para página não encontrada? */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;

