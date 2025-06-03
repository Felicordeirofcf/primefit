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
  const { isAuthenticated, isLoading, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=' + encodeURIComponent(location.pathname))
      } else if (!isProfileComplete && location.pathname !== '/completar-perfil') {
        // Redirecionar para completar perfil se não estiver completo
        navigate('/completar-perfil')
      }
    }
  }, [isLoading, isAuthenticated, isProfileComplete, navigate, location.pathname])
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  // Se o perfil não estiver completo e não estiver na página de completar perfil
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
