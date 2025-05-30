import React from 'react'
import { useAuth } from '../../hooks/useAuth'

const DashboardHeader = ({ user }) => {
  const { logout } = useAuth()
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notificações */}
        <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
          <span className="sr-only">Ver notificações</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        {/* Menu do usuário */}
        <div className="relative">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="ml-2 text-gray-700">{user?.name || 'Usuário'}</span>
          </div>
        </div>
        
        {/* Botão de logout */}
        <button 
          onClick={logout}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <span className="sr-only">Sair</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
