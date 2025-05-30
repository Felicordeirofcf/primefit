import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-display font-bold text-primary-600">PrimeFit</span>
          </Link>
          
          {/* Menu de navegação */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Início
            </Link>
            <Link to="/sobre" className="text-gray-700 hover:text-primary-600 font-medium">
              Sobre
            </Link>
            <Link to="/servicos" className="text-gray-700 hover:text-primary-600 font-medium">
              Serviços
            </Link>
            <Link to="/emagrecimento" className="text-gray-700 hover:text-primary-600 font-medium">
              Emagrecimento
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary-600 font-medium">
              Blog
            </Link>
            <Link to="/contato" className="text-gray-700 hover:text-primary-600 font-medium">
              Contato
            </Link>
          </nav>
          
          {/* Botões de autenticação */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="btn btn-primary py-2">
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Entrar
                </Link>
                <Link to="/cadastro" className="btn btn-primary py-2">
                  Começar Agora
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
