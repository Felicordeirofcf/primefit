import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { FiUsers, FiCheckCircle, FiDollarSign, FiTrendingUp, FiActivity, FiSearch, FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi'; // Using react-icons

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
    if (isAdmin === true && !authLoading) {
      loadAdminData();
    } else if (isAdmin === false && !authLoading) {
      setDataLoading(false);
      setError('Acesso negado.'); // Set error if not admin
    } else if (isAdmin === null && !authLoading) {
        // Still waiting for isAdmin status, keep loading
        setDataLoading(true);
    }
  }, [isAdmin, authLoading]);

  const loadAdminData = async () => {
    setDataLoading(true);
    setError(null); // Reset errors
    console.log('Carregando dados administrativos...');

    try {
      // Fetch users and activities in parallel
      const [usersResponse, activitiesResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_activity').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      // Process Users
      if (usersResponse.error) {
        console.error('Erro ao buscar usuários:', usersResponse.error.message);
        setError('Falha ao carregar dados dos usuários.');
        setUsers([]); // Clear users on error
        // Set stats to zero or handle error state
        setStats({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, newUsersThisMonth: 0 });
      } else {
        const usersData = usersResponse.data || [];
        setUsers(usersData);

        const totalUsers = usersData.length;
        const activeUsers = usersData.filter(u => u.plano_ativo && u.plano_ativo !== 'inativo').length; // Check if plano_ativo exists
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const newUsersThisMonth = usersData.filter(u => {
          if (!u.created_at) return false;
          const createdDate = new Date(u.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        // Placeholder for revenue calculation - needs real logic
        const estimatedRevenue = activeUsers * 97; // Example: Needs actual calculation logic

        setStats({
          totalUsers,
          activeUsers,
          totalRevenue: estimatedRevenue,
          newUsersThisMonth,
        });
        console.log(`Usuários carregados: ${totalUsers}, Ativos: ${activeUsers}`);
      }

      // Process Activities
      if (activitiesResponse.error) {
        console.warn('Erro ao buscar atividades:', activitiesResponse.error.message);
        // Don't use mock data. Set to empty array or show specific error.
        setActivities([]);
        // Optionally set a specific warning for activities
        // setError(prev => prev ? `${prev} Falha ao carregar atividades.` : 'Falha ao carregar atividades.');
      } else {
        setActivities(activitiesResponse.data || []);
        console.log(`Atividades carregadas: ${activitiesResponse.data?.length || 0}`);
      }

    } catch (err) {
      console.error('Erro geral ao carregar dados administrativos:', err);
      setError('Ocorreu um erro inesperado ao carregar o painel.');
      // Reset state on general error
      setUsers([]);
      setActivities([]);
      setStats({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, newUsersThisMonth: 0 });
    } finally {
      setDataLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    if (isAdmin !== true) {
      alert('Ação não permitida.');
      return;
    }
    // Prevent admin from changing their own role?
    // if (userId === user.id) {
    //   alert('Você não pode alterar sua própria role.');
    //   return;
    // }

    try {
      console.log(`Atualizando role do usuário ${userId} para ${newRole}`);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar role:', error.message);
        alert('Erro ao atualizar permissões do usuário.');
        return;
      }

      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      alert('Permissões atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro na requisição de atualização de role:', err);
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
  if (authLoading || isAdmin === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Verificando acesso...</p>
      </div>
    );
  }

  // 2. Access Denied
  if (isAdmin === false) {
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
                        <span className="text-gray-600 text-sm">{/* Icon based on activity.action? */} 📊</span>
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
                        disabled={u.id === user.id} // Prevent self-role change
                        className={`text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${u.id === user.id ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                        <option value="trainer">Trainer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Ver Detalhes"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {/* Add Edit/Delete buttons if needed */}
                      {/* <button className="text-yellow-600 hover:text-yellow-800 transition-colors p-1 rounded hover:bg-yellow-50" title="Editar"><FiEdit className="w-4 h-4" /></button> */} 
                      {/* <button className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50" title="Excluir"><FiTrash2 className="w-4 h-4" /></button> */} 
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum usuário encontrado{searchTerm ? ` para "${searchTerm}"` : ''}.
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
        <ModalUserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

// StatCard Component (Internal or Imported)
const StatCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${selectedColor.bg} ${selectedColor.text}`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider truncate">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

// ModalUserDetails Component (Internal or Imported)
const ModalUserDetails = ({ user, onClose }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-enter" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Detalhes do Usuário</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 rounded-full hover:bg-gray-100"
            aria-label="Fechar modal"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <DetailItem label="ID" value={user.id} />
          <DetailItem label="Nome" value={user.nome || 'Não informado'} />
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="Plano" value={user.plano_ativo || 'inativo'} capitalize />
          <DetailItem label="Role" value={user.role || 'cliente'} capitalize />
          <DetailItem label="Objetivo" value={user.objetivo || 'Não definido'} />
          <DetailItem label="Data de Cadastro" value={formatDate(user.created_at)} />
          <DetailItem label="Último Login" value={formatDateTime(user.last_sign_in_at)} />
          {/* Add more fields as needed */}
          <DetailItem label="Altura" value={user.altura ? `${(user.altura * 100).toFixed(0)} cm` : 'N/A'} />
          <DetailItem label="Peso Inicial" value={user.peso_inicial ? `${user.peso_inicial.toFixed(1)} kg` : 'N/A'} />
          <DetailItem label="Condições de Saúde" value={user.condicoes_saude || 'Nenhuma'} />
        </div>

        <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
          {/* Add actions like 'Edit Profile', 'Reset Password' if needed */}
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Fechar
          </button>
        </div>
      </div>
      {/* Add CSS for modal animation */}
      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter { animation: modal-enter 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// DetailItem Component (Internal)
const DetailItem = ({ label, value, capitalize = false }) => (
  <div className="flex justify-between border-b border-gray-100 py-1.5">
    <dt className="font-medium text-gray-500">{label}:</dt>
    <dd className={`text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
  </div>
);

export default AdminDashboard;

