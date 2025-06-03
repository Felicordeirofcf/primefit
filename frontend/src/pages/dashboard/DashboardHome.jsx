import React from 'react'
import { useAuth } from '../../hooks/useAuth'

const DashboardHome = () => {
  const { user, userProfile } = useAuth()

  // ✅ VERSÃO ULTRA-SIMPLIFICADA - SEM LOADING, SEM CHAMADAS EXTERNAS
  console.log('DashboardHome renderizando para:', userProfile?.nome || user?.email)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo de volta, {userProfile?.nome || user?.email || 'Usuário'}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo do seu progresso e atividades recentes.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Treinos Concluídos</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Peso Atual</p>
              <p className="text-2xl font-semibold text-gray-900">{userProfile?.peso_inicial || '70'} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dias Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">28</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Meta Semanal</p>
              <p className="text-2xl font-semibold text-gray-900">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Progresso */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução do Peso</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">Gráfico de evolução será exibido aqui</p>
            <p className="text-sm text-gray-400 mt-2">Continue registrando seu progresso para ver a evolução</p>
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Treino de Força Concluído</p>
                <p className="text-xs text-gray-500">Hoje às 08:30</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Peso Registrado</p>
                <p className="text-xs text-gray-500">Ontem às 07:00</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nova Mensagem do Consultor</p>
                <p className="text-xs text-gray-500">2 dias atrás</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Treinos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Próximos Treinos</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm font-medium text-gray-900">Treino de Cardio</p>
              <p className="text-xs text-gray-500">Amanhã às 07:00</p>
              <p className="text-xs text-blue-600">30 minutos</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm font-medium text-gray-900">Treino de Força - Membros Superiores</p>
              <p className="text-xs text-gray-500">Quinta-feira às 08:00</p>
              <p className="text-xs text-green-600">45 minutos</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm font-medium text-gray-900">Treino Funcional</p>
              <p className="text-xs text-gray-500">Sexta-feira às 07:30</p>
              <p className="text-xs text-purple-600">40 minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Plano */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Seu Plano Atual</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Plano Premium</p>
            <p className="text-xs text-gray-500">Consultoria personalizada com acompanhamento nutricional</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">Ativo</p>
            <p className="text-xs text-gray-500">Renovação em 15 dias</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

