import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginCadastroCliente.css';

export default function LoginCadastroCliente() {
  const [isLogin, setIsLogin] = useState(true);
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    const payload = isLogin
      ? {
          email: form.email,
          senha: form.senha,
        }
      : form;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("token", data.access_token);
          alert("Login realizado com sucesso!");
          navigate("/dashboard");
        } else {
          alert("Cadastro realizado com sucesso! Faça login para continuar.");
          setIsLogin(true);
        }
      } else {
        alert("Erro: " + (data.detail || "Falha ao processar a solicitação."));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na conexão com o servidor.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>{isLogin ? "Entrar na conta" : "Criar uma conta"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                name="nome"
                placeholder="Nome completo"
                value={form.nome}
                onChange={handleChange}
                required
              />
              <input
                name="endereco"
                placeholder="Endereço"
                value={form.endereco}
                onChange={handleChange}
                required
              />
              <input
                name="cidade"
                placeholder="Cidade"
                value={form.cidade}
                onChange={handleChange}
                required
              />
              <input
                name="cep"
                placeholder="CEP"
                value={form.cep}
                onChange={handleChange}
                required
              />
              <input
                name="telefone"
                placeholder="Telefone"
                value={form.telefone}
                onChange={handleChange}
                required
              />
              <input
                name="whatsapp"
                placeholder="WhatsApp"
                value={form.whatsapp}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-mail"
            required
          />
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            placeholder="Senha"
            required
          />
          <button type="submit" className="btn-primario">
            {isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <p className="alternar-texto">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
          <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
            {isLogin ? "Cadastre-se" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
}
