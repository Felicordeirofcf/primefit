import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../hooks/useAuth';
import { useContext } from 'react';
import logo from '../../assets/primelogo.png';
import { FiLogIn, FiUserPlus, FiGrid, FiLogOut } from 'react-icons/fi';

const Header = () => {
  const { token, user, signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logout successful from Header');
    } catch (error) {
      console.error('Error during logout from Header:', error);
    }
  };

  const isAuthenticated = !!token;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src={logo} alt="Prime Fit Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-blue-600 hidden sm:inline">PrimeFit</span>
          </Link>

          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`} end>Início</NavLink>
            <NavLink to="/sobre" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Sobre</NavLink>
            <NavLink to="/servicos" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Serviços</NavLink>
            <NavLink to="/emagrecimento" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Emagrecimento</NavLink>
            <NavLink to="/blog" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Blog</NavLink>
            <NavLink to="/contato" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Contato</NavLink>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiGrid className="mr-1.5 h-4 w-4" />
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  title="Sair"
                >
                  <FiLogOut className="mr-1.5 h-4 w-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center"
                >
                  <FiLogIn className="mr-1 h-4 w-4" />
                  Entrar
                </NavLink>
                <NavLink
                  to="/cadastro"
                  className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiUserPlus className="mr-1.5 h-4 w-4" />
                  Começar Agora
                </NavLink>
              </>
            )}
          </div>

          <div className="-mr-2 flex md:hidden ml-3">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500" aria-controls="mobile-menu" aria-expanded="false">
              <span className="sr-only">Abrir menu</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
