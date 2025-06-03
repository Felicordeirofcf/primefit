import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { FiBell, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi'; // Using react-icons for consistency

const DashboardHeader = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  // Get user profile and signOut function from useAuth
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        // Optionally show an error message to the user
        alert('Erro ao sair. Tente novamente.');
      } else {
        console.log('Logout bem-sucedido, redirecionando...');
        navigate('/login'); // Redirect to login page after successful logout
      }
    } catch (err) {
      console.error('Erro inesperado durante o logout:', err);
      alert('Ocorreu um erro inesperado ao tentar sair.');
    }
  };

  // Get user's first initial or default 'U'
  const userInitial = userProfile?.nome?.charAt(0).toUpperCase() || userProfile?.email?.charAt(0).toUpperCase() || 'U';
  const userName = userProfile?.nome || userProfile?.email?.split('@')[0] || 'Usuário';

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left side: Mobile Menu Toggle and Title */} 
      <div className="flex items-center">
        {/* Hamburger button for mobile */} 
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden mr-3"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>

        {/* Title (optional, can be removed if sidebar has it) */} 
        {/* <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Dashboard</h1> */} 
      </div>

      {/* Right side: Notifications, User Menu, Logout */} 
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Notifications Button */} 
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
          <span className="sr-only">Ver notificações</span>
          <FiBell className="h-5 w-5" />
          {/* Optional: Notification badge */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span> */}
        </button>

        {/* User Info and Logout */} 
        <div className="flex items-center space-x-2">
           {/* User Avatar/Initial */} 
           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm ring-1 ring-blue-200">
             {userInitial}
           </div>
           {/* User Name (optional, shown on larger screens) */} 
           <span className="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[150px]" title={userName}>
             {userName}
           </span>
        </div>

        {/* Logout Button */} 
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out"
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

