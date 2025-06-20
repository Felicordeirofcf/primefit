import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './CompletarPerfil.css';

export default function CompletarPerfil() {
  const { user, userProfile, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    full_name: '',
    birth_date: '',
    phone: '',
    goal: '',
    height: '',
    weight: '',
    health_conditions: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Preencher o formulário com dados existentes, se houver
  useEffect(() => {
    if (userProfile) {
      setForm({
        full_name: userProfile.nome || '',
        birth_date: userProfile.data_nascimento || '',
        phone: userProfile.telefone || '',
        goal: userProfile.objetivo || '',
        height: userProfile.altura ? Math.round(userProfile.altura * 100) : '', // Converter de metros para cm
        weight: userProfile.peso_inicial || '',
        health_conditions: userProfile.condicoes_saude || ''
      });
    }
  }, [userProfile]);
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Validar campos obrigatórios
      if (!form.full_name) {
        throw new Error('Nome completo é obrigatório');
      }
      
      const result = await updateProfile(form);
      
      // ✅ CORREÇÃO: Verificar se result.error é null (sucesso) em vez de result.success
      if (!result.error) {
        setSuccess('Perfil atualizado com sucesso!');
        
        // Aguardar um pouco para mostrar a mensagem de sucesso
        setTimeout(() => {
          // Redirecionar para o dashboard após completar o perfil
          navigate('/dashboard');
        }, 1500);
      } else {
        // Se há erro, mostrar a mensagem de erro
        setError(result.error.message || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      console.error('Erro no handleSubmit:', err);
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="completar-perfil-container loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="completar-perfil-container">
      <div className="completar-perfil-card">
        <h2>Complete seu Perfil</h2>
        <p className="instrucao">
          Para uma melhor experiência, precisamos de algumas informações adicionais.
        </p>
        
        {/* ✅ CORREÇÃO: Mostrar mensagem de sucesso */}
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Nome Completo*</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="birth_date">Data de Nascimento</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Telefone/WhatsApp</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="goal">Objetivo Principal</label>
            <select
              id="goal"
              name="goal"
              value={form.goal}
              onChange={handleChange}
            >
              <option value="">Selecione um objetivo</option>
              <option value="emagrecimento">Emagrecimento</option>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="condicionamento">Condicionamento Físico</option>
              <option value="saude">Saúde e Bem-estar</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="height">Altura (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={form.height}
                onChange={handleChange}
                placeholder="170"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="weight">Peso (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="70"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="health_conditions">Condições de Saúde</label>
            <textarea
              id="health_conditions"
              name="health_conditions"
              value={form.health_conditions}
              onChange={handleChange}
              placeholder="Informe se possui alguma condição de saúde, lesão ou restrição física"
              rows="3"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="btn-primario" 
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Salvando...' : success ? 'Redirecionando...' : 'Salvar e Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}

