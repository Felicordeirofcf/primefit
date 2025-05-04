import React, { useState, useEffect } from 'react';
import './CadastroPopup.css';

export default function CadastroPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    cidade: '',
    cep: ''
  });
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/cliente/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setMensagem('Cadastro realizado com sucesso!');
      setTimeout(() => setShowPopup(false), 2000);
    } else {
      const erro = await res.json();
      setMensagem(`Erro: ${erro.detail}`);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-form">
        <h2>Receba benefícios e descontos exclusivos!</h2>
        <form onSubmit={handleSubmit}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <input name="email" placeholder="E-mail" type="email" value={form.email} onChange={handleChange} required />
          <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
          <input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} />
          <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />
          <input name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} />
          <input name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} />
          <button type="submit">Cadastrar</button>
        </form>
        <p>{mensagem}</p>
        <button className="fechar" onClick={() => setShowPopup(false)}>X</button>
      </div>
    </div>
  );
}
