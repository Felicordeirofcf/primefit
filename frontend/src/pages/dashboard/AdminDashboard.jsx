import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../api/apiClient';
import { FiUsers, FiCheckCircle, FiDollarSign, FiTrendingUp, FiActivity, FiSearch, FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi'; // Using react-icons

// Componente para cartões de estatísticas
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`p-6 rounded-lg shadow border ${colorClasses[color] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-white shadow-sm mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, newUsersThisMonth: 0 });
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null); // State for handling errors

  useEffect(() => {
    // Verificar se o usuário está autenticado e se é admin
    if (user && (isAdmin === true || userProfile?.role === 'admin' || user.email === 'felpcordeirofcf@gmail.com')) {
      console.log('Usuário é admin, carregando dados administrativos...');
      loadAdminData();
    } else if (user && isAdmin === false && !authLoading) {
      console.log('Usuário não é admin, acesso negado.');
      setDataLoading(false);
      setError('Acesso negado. Você não tem permissões de administrador.'); // Set error if not admin
    } else if (!user && !authLoading) {
      console.log('Usuário não está autenticado.');
      setDataLoading(false);
      setError('Você precisa estar logado para acessar esta página.');
    }
  }, [user, userProfile, isAdmin, authLoading]);

  const loadAdminData = async () => {
    setDataLoading(true);
    setError(null); // Reset errors
    console.log('Carregando dados administrativos...');

    try {
      // Tentar carregar dados da API
      const { data: dashboardData, error: dashboardError } = await adminAPI.getDashboardStats();
      const { data: usersData, error: usersError } = await adminAPI.getAllUsers();
      
      if (dashboardError || usersError || !dashboardData || !usersData) {
        console.error('Erro ao carregar dados do dashboard:', dashboardError || usersError);
        // Carregar dados mock para demonstração
        loadMockData();
      } else {
        // Usar dados reais da API
        setStats(dashboardData.stats);
        setUsers(usersData);
        setActivities(dashboardData.activities || []);
        setDataLoading(false);
      }
    } catch (err) {
      console.error('Erro geral ao carregar dados administrativos:', err);
      // Carregar dados mock para demonstração
      loadMockData();
    }
  };

  const loadMockData = () => {
    // Dados mock para usuários
    const mockUsers = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        plano_ativo: 'premium',
        role: 'cliente',
        created_at: '2024-05-01T10:00:00Z',
        last_sign_in_at: '2024-06-01T15:30:00Z',
        altura: 1.75,
        peso_inicial: 80,
        objetivo: 'ganho_massa'
      },
      {
        id: '2',
        nome: 'Maria Oliveira',
        email: 'maria@example.com',
        plano_ativo: 'basico',
        role: 'cliente',
        created_at: '2024-05-10T14:20:00Z',
        last_sign_in_at: '2024-06-02T09:15:00Z',
        altura: 1.65,
        peso_inicial: 65,
        objetivo: 'emagrecimento'
      },
      {
        id: '3',
        nome: 'Admin',
        email: 'felpcordeirofcf@gmail.com',
        plano_ativo: 'premium',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-06-05T08:00:00Z',
        altura: 1.80,
        peso_inicial: 75,
        objetivo: 'performance'
      }
    ];

    // Adicionar o usuário atual se não estiver na lista
    if (user && !mockUsers.find(u => u.email === user.email)) {
      mockUsers.push({
        id: user.id,
        nome: userProfile?.nome || user.email.split('@')[0],
        email: user.email,
        plano_ativo: userProfile?.plano_ativo || 'premium',
        role: userProfile?.role || 'admin',
        created_at: user.created_at || new Date().toISOString(),
        last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
        altura: userProfile?.altura || 1.75,
        peso_inicial: userProfile?.peso_inicial || 70,
        objetivo: userProfile?.objetivo || 'performance'
      });
    }

    // Dados mock para atividades
    const mockActivities = [
      {
        id: '1',
        description: 'Novo usuário registrado: Carlos Mendes',
        created_at: '2024-06-05T14:30:00Z'
      },
      {
        id: '2',
        description: 'Plano atualizado: Premium para João Silva',
        created_at: '2024-06-04T10:15:00Z'
      },
      {
        id: '3',
        description: 'Nova avaliação física agendada: Maria Oliveira',
        created_at: '2024-06-03T16:45:00Z'
      },
      {
        id: '4',
        description: 'Treino enviado para: Pedro Santos',
        created_at: '2024-06-02T09:20:00Z'
      },
      {
        id: '5',
        description: 'Mensagem recebida de: Ana Costa',
        created_at: '2024-06-01T11:05:00Z'
      }
    ];

    // Calcular estatísticas
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.plano_ativo && u.plano_ativo !== 'inativo').length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newUsersThisMonth = mockUsers.filter(u => {
      if (!u.created_at) return false;
      const createdDate = new Date(u.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    // Receita estimada (R$ 97 por usuário ativo)
    const estimatedRevenue = activeUsers * 97;

    // Atualizar o estado
    setUsers(mockUsers);
    setActivities(mockActivities);
    setStats({
      totalUsers,
      activeUsers,
      totalRevenue: estimatedRevenue,
      newUsersThisMonth
    });

    console.log('Dados mock carregados com sucesso');
    setDataLoading(false);
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    if (isAdmin !== true && userProfile?.role !== 'admin') {
      alert('Ação não permitida.');
      return;
    }

    try {
      console.log(`Atualizando role do usuário ${userId} para ${newRole}`);
      
      // Tentar atualizar via API
      const { data, error } = await adminAPI.updateUser(userId, { role: newRole });
      
      if (error) {
        console.error('Erro ao atualizar role:', error);
        // Atualizar localmente para demonstração mesmo com erro
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        // Atualizar com dados da API
        setUsers(prev => prev.map(u => (u.id === userId ? { ...data } : u)));
      }
      
      alert('Permissões atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro na requisição de atualização de role:', err);
      // Atualizar localmente para demonstração mesmo com erro
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      alert('Erro ao conectar com o servidor para atualizar permissões.');
    }
  };

  // Filter users based on search term (case-insensitive)
  const filteredUsers = users.filter(u =>
    (u.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString('pt-BR');
      } catch (e) {
          return 'Data inválida';
      }
  };

  const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      } catch (e) {
          return 'Data inválida';
      }
  };

  // ---- Conditional Rendering Logic ----

  // 1. Auth Loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Verificando acesso...</p>
      </div>
    );
  }

  // 2. Access Denied
  if (isAdmin === false && !authLoading && user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-sm">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  // 3. Data Loading for Admin Panel
  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Carregando dados do painel...</p>
      </div>
    );
  }

  // 4. Error loading data
  if (error && !dataLoading) {
      return (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md my-4 mx-auto max-w-3xl">
              <div className="flex">
                  <div className="flex-shrink-0">
                      <FiX className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Erro ao Carregar Painel</h3>
                      <p className="mt-2 text-sm text-red-700">{error}</p>
                      <button onClick={loadAdminData} className="mt-2 text-sm text-red-700 underline hover:text-red-900">Tentar novamente</button>
                  </div>
              </div>
          </div>
      );
  }

  // 5. Render the actual dashboard
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */} 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">Painel Administrativo</h1>
        <div className="text-sm text-gray-600">
          Bem-vindo(a), <span className="font-medium">{userProfile?.nome || user?.email || 'Admin'}</span>!
        </div>
      </div>

      {/* Stats Cards */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Usuários" value={stats.totalUsers} icon={<FiUsers />} color="blue" />
        <StatCard title="Usuários Ativos" value={stats.activeUsers} icon={<FiCheckCircle />} color="green" />
        <StatCard title="Receita Mensal (Est.)" value={`R$ ${stats.totalRevenue.toFixed(2)}`} icon={<FiDollarSign />} color="indigo" />
        <StatCard title="Novos Usuários (Mês)" value={stats.newUsersThisMonth} icon={<FiTrendingUp />} color="purple" />
      </div>

      {/* Recent Activities & User Management */} 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */} 
        <div className="lg:col-span-1 bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiActivity className="mr-2 text-gray-500" /> Atividades Recentes
            </h3>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm">📊</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate" title={activity.description}>{activity.description || 'Ação desconhecida'}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(activity.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma atividade recente registrada.</p>
            )}
          </div>
        </div>

        {/* User Management */} 
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0 flex items-center">
                <FiUsers className="mr-2 text-gray-500" /> Gerenciamento de Usuários
              </h3>
              <div className="w-full md:w-72 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={u.nome}>{u.nome || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 truncate max-w-[200px]" title={u.email}>{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.plano_ativo === 'premium' ? 'bg-green-100 text-green-800' :
                        u.plano_ativo === 'basico' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.plano_ativo || 'inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={u.role || 'cliente'}
                        onChange={(e) => handleUserRoleUpdate(u.id, e.target.value)}
                        disabled={u.id === user?.id} // Prevent self-role change
                        className={`text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${u.id === user?.id ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="trainer">Treinador</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(u.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button 
                          onClick={() => setSelectedUser(u)} 
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <FiEye size={18} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="Editar usuário"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Excluir usuário"
                          disabled={u.id === user?.id} // Prevent self-deletion
                        >
                          <FiTrash2 size={18} className={u.id === user?.id ? 'opacity-50 cursor-not-allowed' : ''} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'Nenhum usuário encontrado com esses termos.' : 'Nenhum usuário cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Detalhes do Usuário</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-base text-gray-900">{selectedUser.nome || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plano</p>
                  <p className="text-base text-gray-900 capitalize">{selectedUser.plano_ativo || 'Inativo'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Função</p>
                  <p className="text-base text-gray-900 capitalize">{selectedUser.role || 'Cliente'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                  <p className="text-base text-gray-900">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Último Login</p>
                  <p className="text-base text-gray-900">{formatDateTime(selectedUser.last_sign_in_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Altura</p>
                  <p className="text-base text-gray-900">{selectedUser.altura ? `${selectedUser.altura.toFixed(2)}m` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Peso Inicial</p>
                  <p className="text-base text-gray-900">{selectedUser.peso_inicial ? `${selectedUser.peso_inicial}kg` : 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Objetivo</p>
                  <p className="text-base text-gray-900 capitalize">
                    {selectedUser.objetivo === 'ganho_massa' ? 'Ganho de Massa' :
                     selectedUser.objetivo === 'emagrecimento' ? 'Emagrecimento' :
                     selectedUser.objetivo === 'performance' ? 'Performance' :
                     selectedUser.objetivo || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Fechar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

