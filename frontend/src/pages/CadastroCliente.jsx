import { useState } from "react";
import "./CadastroCliente.css"; // ➕ Garanta que esse CSS existe

export default function CadastroCliente() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    endereco: "",
    cidade: "",
    cep: "",
    telefone: "",
    whatsapp: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://primefit-production-e300.up.railway.app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("Cadastro realizado com sucesso!");
        setForm({
          nome: "",
          email: "",
          senha: "",
          endereco: "",
          cidade: "",
          cep: "",
          telefone: "",
          whatsapp: ""
        });
      } else {
        const erro = await res.json();
        console.error("Erro ao cadastrar:", erro);
        alert("Erro ao cadastrar: " + (erro.detail || JSON.stringify(erro)));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na requisição: " + error.message);
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Cliente</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input type="password" name="senha" value={form.senha} onChange={handleChange} placeholder="Senha" required />
        <input type="text" name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço" required />
        <input type="text" name="cidade" value={form.cidade} onChange={handleChange} placeholder="Cidade" required />
        <input type="text" name="cep" value={form.cep} onChange={handleChange} placeholder="CEP" required />
        <input type="text" name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" required />
        <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp" required />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}


