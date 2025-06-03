import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

const Profile = () => {
  const { user, userProfile, updateProfile } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    height: '',
    goal: '',
    activityLevel: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Carregar dados reais do usuário
  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.nome || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.telefone || '',
        birthDate: userProfile.data_nascimento || '',
        gender: userProfile.genero || '',
        height: userProfile.altura ? Math.round(userProfile.altura * 100) : '', // Converter de metros para cm
        goal: userProfile.objetivo || '',
        activityLevel: userProfile.nivel_atividade || '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }
      })
      setLoading(false)
    } else if (user) {
      // Se não há perfil mas há usuário, usar dados básicos
      setProfile(prev => ({
        ...prev,
        email: user.email || ''
      }))
      setLoading(false)
    }
  }, [userProfile, user])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setIsSaving(true)
    
    try {
      // Mapear dados para o formato esperado pelo backend
      const profileData = {
        full_name: profile.name,
        birth_date: profile.birthDate,
        phone: profile.phone,
        goal: profile.goal,
        height: profile.height,
        weight: '', // Não temos peso no perfil, deixar vazio
        health_conditions: ''
      }
      
      const result = await updateProfile(profileData)
      
      if (result.success) {
        setIsEditing(false)
        console.log('Perfil atualizado com sucesso!')
      } else {
        console.error('Erro ao atualizar perfil:', result.message)
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
  
  const formatGender = (gender) => {
    const genderMap = {
      'masculino': 'Masculino',
      'feminino': 'Feminino',
      'outro': 'Outro'
    }
    return genderMap[gender] || gender || 'Não informado'
  }
  
  const formatGoal = (goal) => {
    const goalMap = {
      'emagrecimento': 'Emagrecimento',
      'ganho_massa': 'Ganho de massa muscular',
      'performance': 'Melhora da performance',
      'bem_estar': 'Bem-estar geral'
    }
    return goalMap[goal] || goal || 'Não informado'
  }
  
  const formatActivityLevel = (level) => {
    const levelMap = {
      'sedentario': 'Sedentário',
      'leve': 'Levemente ativo',
      'moderado': 'Moderadamente ativo',
      'intenso': 'Muito ativo',
      'muito_intenso': 'Extremamente ativo'
    }
    return levelMap[level] || level || 'Não informado'
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-outline w-full sm:w-auto"
          >
            Editar Perfil
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(false)}
            className="btn btn-outline w-full sm:w-auto"
          >
            Cancelar
          </button>
        )}
      </div>
      
      <div className="card p-4 md:p-6">
        {!isEditing ? (
          // Modo visualização
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mx-auto sm:mx-0 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold">{profile.name || 'Nome não informado'}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-gray-600">{profile.phone || 'Telefone não informado'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Data de Nascimento</span>
                    <span className="text-sm font-medium mt-1 sm:mt-0">{formatDate(profile.birthDate) || 'Não informado'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Gênero</span>
                    <span className="text-sm font-medium mt-1 sm:mt-0">{formatGender(profile.gender)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Altura</span>
                    <span className="text-sm font-medium mt-1 sm:mt-0">{profile.height ? `${profile.height} cm` : 'Não informado'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Objetivo</span>
                    <span className="text-sm font-medium mt-1 sm:mt-0">{formatGoal(profile.goal)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Nível de Atividade</span>
                    <span className="text-sm font-medium mt-1 sm:mt-0">{formatActivityLevel(profile.activityLevel)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Plano Ativo</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="font-medium">
                        {userProfile?.plano_ativo === 'serie_unica' ? 'Série Única' : 
                         userProfile?.plano_ativo === 'consultoria_completa' ? 'Consultoria Completa' : 
                         'Nenhum plano ativo'}
                      </p>
                      <p className="text-sm text-gray-500">Status do plano</p>
                    </div>
                    {userProfile?.plano_ativo !== 'inativo' && (
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Segurança</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-4">
                <div>
                  <h4 className="font-medium">Senha</h4>
                  <p className="text-sm text-gray-500">Última alteração há 3 meses</p>
                </div>
                <button className="btn btn-outline btn-sm w-full sm:w-auto">Alterar Senha</button>
              </div>
            </div>
          </div>
        ) : (
          // Modo edição
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mx-auto sm:mx-0 relative group flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="button" className="text-white text-sm">Alterar</button>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="name" className="label">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="input w-full"
                      required
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">Telefone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="birthDate" className="label">Data de Nascimento</label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={profile.birthDate}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="label">Gênero</label>
                      <select
                        id="gender"
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="input w-full"
                      >
                        <option value="">Selecione</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="height" className="label">Altura (cm)</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={profile.height}
                      onChange={handleChange}
                      className="input w-full"
                      min="100"
                      max="250"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="goal" className="label">Objetivo Principal</label>
                    <select
                      id="goal"
                      name="goal"
                      value={profile.goal}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="">Selecione</option>
                      <option value="emagrecimento">Emagrecimento</option>
                      <option value="ganho_massa">Ganho de massa muscular</option>
                      <option value="performance">Melhora da performance</option>
                      <option value="bem_estar">Bem-estar geral</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="activityLevel" className="label">Nível de Atividade</label>
                    <select
                      id="activityLevel"
                      name="activityLevel"
                      value={profile.activityLevel}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="">Selecione</option>
                      <option value="sedentario">Sedentário</option>
                      <option value="leve">Levemente ativo</option>
                      <option value="moderado">Moderadamente ativo</option>
                      <option value="intenso">Muito ativo</option>
                      <option value="muito_intenso">Extremamente ativo</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Endereço (Opcional)</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="address.street" className="label">Rua</label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={profile.address.street}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.number" className="label">Número</label>
                      <input
                        type="text"
                        id="address.number"
                        name="address.number"
                        value={profile.address.number}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="address.complement" className="label">Complemento</label>
                    <input
                      type="text"
                      id="address.complement"
                      name="address.complement"
                      value={profile.address.complement}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address.neighborhood" className="label">Bairro</label>
                    <input
                      type="text"
                      id="address.neighborhood"
                      name="address.neighborhood"
                      value={profile.address.neighborhood}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address.city" className="label">Cidade</label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={profile.address.city}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="address.state" className="label">Estado</label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={profile.address.state}
                        onChange={handleChange}
                        className="input w-full"
                        maxLength="2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="address.zipCode" className="label">CEP</label>
                    <input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={profile.address.zipCode}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit" 
                className="btn btn-primary w-full sm:w-auto" 
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="btn btn-outline w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile

