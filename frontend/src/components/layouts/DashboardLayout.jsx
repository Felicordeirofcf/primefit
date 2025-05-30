import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'

const DashboardLayout = () => {
  const { user } = useAuth()
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard header */}
        <DashboardHeader user={user} />
        
        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
