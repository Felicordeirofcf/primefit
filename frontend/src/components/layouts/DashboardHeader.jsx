import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const DashboardHeader = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao sair. Tente novamente.');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Erro inesperado durante o logout:', err);
      alert('Ocorreu um erro inesperado ao tentar sair.');
    }
  };

  const userInitial = userProfile?.nome?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || 'U';
  const userName = userProfile?.nome || userProfile?.email?.split('@')[0] || 'Usuário';

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left: Toggle Menu */}
      <div className="flex items-center">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden mr-3"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Notifications */}
        <button
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Ver notificações"
        >
          <FiBell className="h-5 w-5" />
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm ring-1 ring-blue-200">
            {userInitial}
          </div>
          <span
            className="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[150px]"
            title={userName}
          >
            {userName}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label="Sair"
          title="Sair"
        >
          <FiLogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
