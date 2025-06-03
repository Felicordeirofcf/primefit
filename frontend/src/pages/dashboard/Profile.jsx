import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    height: '',
    goal: '',
    activityLevel: '',
    medicalConditions: '',
    allergies: '',
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
  
  // Dados simulados para demonstração
  useEffect(() => {
    // Simulação de chamada à API
    setTimeout(() => {
      const mockProfile = {
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        phone: '(11) 98765-4321',
        birthDate: '1985-06-15',
        gender: 'Masculino',
        height: 175,
        goal: 'Perda de peso',
        activityLevel: 'Moderadamente ativo',
        medicalConditions: 'Nenhuma',
        allergies: 'Nenhuma',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Jardim Primavera',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        }
      }
      
      setProfile(mockProfile)
      setLoading(false)
    }, 1500)
  }, [])
  
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
    
    // Simulação de envio para API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSaving(false)
    setIsEditing(false)
    
    // Aqui seria feita a chamada real para a API
    console.log('Perfil atualizado:', profile)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-outline"
          >
            Editar Perfil
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(false)}
            className="btn btn-outline"
          >
            Cancelar
          </button>
        )}
      </div>
      
      <div className="card p-6">
        {!isEditing ? (
          // Modo visualização
          <div>
            <div className="flex items-center mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-gray-600">{profile.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Data de Nascimento</td>
                      <td className="py-3 text-sm font-medium text-right">{formatDate(profile.birthDate)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Gênero</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.gender}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Altura</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.height} cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Objetivo</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.goal}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Nível de Atividade</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.activityLevel}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Condições Médicas</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.medicalConditions || 'Nenhuma'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Alergias</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.allergies || 'Nenhuma'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Endereço</h3>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Rua</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.street}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Número</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.number}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Complemento</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.complement || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Bairro</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.neighborhood}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Cidade</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.city}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">Estado</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.state}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm text-gray-500">CEP</td>
                      <td className="py-3 text-sm font-medium text-right">{profile.address.zipCode}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Segurança</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Senha</h4>
                  <p className="text-sm text-gray-500">Última alteração há 3 meses</p>
                </div>
                <button className="btn btn-outline btn-sm">Alterar Senha</button>
              </div>
            </div>
          </div>
        ) : (
          // Modo edição
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-6 relative group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="button" className="text-white text-sm">Alterar</button>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <label htmlFor="name" className="label">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="input"
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
                      className="input"
                      required
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
                      className="input"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="birthDate" className="label">Data de Nascimento</label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={profile.birthDate}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="label">Gênero</label>
                    <select
                      id="gender"
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="height" className="label">Altura (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                    className="input"
                    min="100"
                    max="250"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="goal" className="label">Objetivo Principal</label>
                  <select
                    id="goal"
                    name="goal"
                    value={profile.goal}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Selecione</option>
                    <option value="Perda de peso">Perda de peso</option>
                    <option value="Ganho de massa muscular">Ganho de massa muscular</option>
                    <option value="Melhora do condicionamento">Melhora do condicionamento</option>
                    <option value="Saúde geral">Saúde geral</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="activityLevel" className="label">Nível de Atividade</label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={profile.activityLevel}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Selecione</option>
                    <option value="Sedentário">Sedentário (pouco ou nenhum exercício)</option>
                    <option value="Levemente ativo">Levemente ativo (exercício leve 1-3 dias/semana)</option>
                    <option value="Moderadamente ativo">Moderadamente ativo (exercício moderado 3-5 dias/semana)</option>
                    <option value="Muito ativo">Muito ativo (exercício intenso 6-7 dias/semana)</option>
                    <option value="Extremamente ativo">Extremamente ativo (exercício muito intenso, trabalho físico)</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="medicalConditions" className="label">Condições Médicas</label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={profile.medicalConditions}
                    onChange={handleChange}
                    className="input"
                    rows="2"
                    placeholder="Liste condições médicas relevantes ou digite 'Nenhuma'"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="allergies" className="label">Alergias</label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    value={profile.allergies}
                    onChange={handleChange}
                    className="input"
                    rows="2"
                    placeholder="Liste alergias relevantes ou digite 'Nenhuma'"
                  ></textarea>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Endereço</h3>
                
                <div className="mb-4">
                  <label htmlFor="address.street" className="label">Rua</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={profile.address.street}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="address.number" className="label">Número</label>
                    <input
                      type="text"
                      id="address.number"
                      name="address.number"
                      value={profile.address.number}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="address.complement" className="label">Complemento</label>
                    <input
                      type="text"
                      id="address.complement"
                      name="address.complement"
                      value={profile.address.complement}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address.neighborhood" className="label">Bairro</label>
                  <input
                    type="text"
                    id="address.neighborhood"
                    name="address.neighborhood"
                    value={profile.address.neighborhood}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="address.city" className="label">Cidade</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={profile.address.city}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="address.state" className="label">Estado</label>
                    <select
                      id="address.state"
                      name="address.state"
                      value={profile.address.state}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address.zipCode" className="label">CEP</label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={profile.address.zipCode}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
