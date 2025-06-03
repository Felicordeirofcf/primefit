import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import DashboardLayout from './components/layouts/DashboardLayout'

// Páginas públicas
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WeightLossPage from './pages/WeightLossPage'
import CompletarPerfil from './pages/CompletarPerfil'

// Páginas do dashboard
import DashboardHome from './pages/dashboard/DashboardHome'
import TrainingPlan from './pages/dashboard/TrainingPlan'
import Progress from './pages/dashboard/Progress'
import Assessments from './pages/dashboard/Assessments'
import Profile from './pages/dashboard/Profile'
import Messages from './pages/dashboard/Messages'
import AdminDashboard from './pages/dashboard/AdminDashboard'

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, userProfile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=' + encodeURIComponent(location.pathname))
      } else {
        // ✅ CORREÇÃO: Verificar se é admin ou se perfil está completo
        const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo)
        
        // Se é admin, permitir acesso a qualquer rota do dashboard
        if (isAdmin) {
          console.log('Usuário é admin - acesso liberado para:', location.pathname)
          return // ✅ Admin tem acesso livre
        }
        
        // Se não é admin, verificar se perfil está completo
        if (!isProfileComplete && location.pathname !== '/completar-perfil') {
          console.log('Perfil incompleto, redirecionando para completar perfil')
          navigate('/completar-perfil')
        }
      }
    }
  }, [loading, isAuthenticated, userProfile, isAdmin, navigate, location.pathname])
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  // ✅ CORREÇÃO: Se é admin, sempre permitir acesso
  if (isAdmin) {
    return children
  }
  
  // Se não é admin, verificar se perfil está completo
  const isProfileComplete = !!(userProfile?.nome && userProfile?.objetivo)
  if (!isProfileComplete && location.pathname !== '/completar-perfil') {
    return null
  }
  
  return children
}

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
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App

