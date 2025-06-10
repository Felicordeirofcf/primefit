import { useState } from "react";
import "./CadastroCliente.css";

export default function CadastroCliente() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    endereco: "",
    cidade: "",
    cep: "",
    telefone: "",
    whatsapp: "",
    tipo_usuario: "client" // Corrigido para minúsculo para alinhar com backend
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Dados do formulário enviados:", form);
    try {
      const res = await fetch("https://primefit-production-e300.up.railway.app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      console.log("Resposta da API (res.ok):", res.ok);
      console.log("Status da resposta:", res.status);

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
          whatsapp: "",
          tipo_usuario: "client"
        });
      } else {
        const errorData = await res.json();
        console.error("Erro ao cadastrar (dados do backend):", errorData);
        alert("Erro ao cadastrar: " + (errorData.detail ? JSON.stringify(errorData.detail) : JSON.stringify(errorData)));
      }
    } catch (error) {
      console.error("Erro na requisição (catch block):", error);
      alert("Erro na requisição: " + error.message);
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Cliente</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input type="password" autoComplete="new-password" name="senha" value={form.senha} onChange={handleChange} placeholder="Senha" required />
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
