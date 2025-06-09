import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiBarChart2,
  FiClipboard,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiArrowLeft,
  FiGrid,
  FiZap
} from 'react-icons/fi';
import logo from '../../assets/primelogo.png';

const DashboardSidebar = ({ className = '', isMobile = false, onClose }) => {
  const { pathname } = useLocation();
  const { userProfile, isAdmin, signOut, user } = useAuth();

  const isUserAdmin = isAdmin === true || userProfile?.role === 'admin' || (user?.email === 'felpcordeirofcf@gmail.com');

  const baseNavLinks = [
    { name: 'Visão Geral', path: '/dashboard', icon: FiGrid, exact: true },
    { name: 'Meus Treinos', path: '/dashboard/treinos', icon: FiZap },
    { name: 'Meu Progresso', path: '/dashboard/progresso', icon: FiBarChart2 },
    { name: 'Avaliações', path: '/dashboard/avaliacoes', icon: FiClipboard },
    { name: 'Mensagens', path: '/dashboard/mensagens', icon: FiMessageSquare },
    { name: 'Meu Perfil', path: '/dashboard/perfil', icon: FiUser }
  ];

  const adminLinks = [
    { name: 'Painel Admin', path: '/dashboard/admin', icon: FiSettings }
  ];

  const navLinks = isUserAdmin ? [...baseNavLinks, ...adminLinks] : baseNavLinks;

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (isMobile && onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userInitial = userProfile?.nome?.charAt(0).toUpperCase() || userProfile?.email?.charAt(0).toUpperCase() || 'U';
  const userName = userProfile?.nome || userProfile?.email?.split('@')[0] || 'Usuário';
  const userEmail = userProfile?.email || 'Carregando...';

  return (
    <div className={`bg-white w-64 shadow-lg flex flex-col ${isMobile ? 'h-full fixed inset-y-0 left-0 z-50' : 'h-screen sticky top-0'} ${className}`}>
      <div className="flex items-center justify-between h-16 border-b px-4 flex-shrink-0">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600">
          <img src={logo} alt="Prime Fit Logo" className="h-8 w-auto" />
          <span>PrimeFit</span>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label="Fechar menu"
          >
            <FiX className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg ring-1 ring-blue-200">
            {userInitial}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="font-medium text-gray-800 truncate text-sm" title={userName}>{userName}</p>
            <p className="text-xs text-gray-500 truncate" title={userEmail}>{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={handleLinkClick}
            end={link.exact}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {link.icon && (
              <link.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  pathname === link.path ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t flex-shrink-0 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 group transition-colors duration-150 ease-in-out"
        >
          <FiLogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" aria-hidden="true" />
          Sair
        </button>
        <Link
          to="/"
          onClick={handleLinkClick}
          className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 group transition-colors duration-150 ease-in-out"
        >
          <FiArrowLeft className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
          Voltar ao Site
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;
