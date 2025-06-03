import React from 'react'
import { Routes, Route } from 'react-router-dom'
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

// Páginas do dashboard
import DashboardHome from './pages/dashboard/DashboardHome'
import TrainingPlan from './pages/dashboard/TrainingPlan'
import Progress from './pages/dashboard/Progress'
import Assessments from './pages/dashboard/Assessments'
import Profile from './pages/dashboard/Profile'
import Messages from './pages/dashboard/Messages'

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  }
  
  if (!isAuthenticated) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
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
      </Route>
    </Routes>
  )
}

export default App
