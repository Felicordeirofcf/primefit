import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './DashboardCliente.css';

export default function DashboardCliente() {
  const [cliente, setCliente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [treinosPdf, setTreinosPdf] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/cliente");
      return;
    }

    fetch("http://localhost:8000/auth/clientes/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then(setCliente)
      .catch(() => navigate("/cliente"));
  }, [token, navigate]);

  useEffect(() => {
    if (!cliente?.email) return;

    // Histórico
    fetch(`http://localhost:8000/admin/historico/${encodeURIComponent(cliente.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setHistorico(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Erro ao buscar histórico:", err.message);
        setHistorico([]);
      });

    // Eventos
    fetch(`http://localhost:8000/admin/eventos/${encodeURIComponent(cliente.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Erro ao buscar eventos:", err.message);
        setEventos([]);
      });

    // Treinos enviados em PDF
    fetch(`http://localhost:8000/cliente/treinos-enviados?cliente_email=${encodeURIComponent(cliente.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setTreinosPdf(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Erro ao buscar treinos PDF:", err.message);
        setTreinosPdf([]);
      });

  }, [cliente, token]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/cliente");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !cliente?.email) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", cliente.email); // necessário para backend

    try {
      const res = await fetch("http://localhost:8000/auth/upload_docs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      alert(res.ok ? "✅ Arquivo enviado com sucesso!" : "❌ Erro ao enviar arquivo");
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("❌ Falha ao enviar arquivo");
    }
  };

  if (!cliente) return <p>Carregando...</p>;

  return (
    <div className="dashboard-cliente">
      <h2>Bem-vindo(a), {cliente.nome}</h2>
      <p><strong>Plano:</strong> {cliente.plano || "nenhum"}</p>
      <p><strong>Status:</strong> {cliente.status_plano || "inativo"}</p>

      {cliente.link_app && (
        <p><strong>Treino App:</strong> <a href={cliente.link_app} target="_blank" rel="noopener noreferrer">Acessar MFIT/TECNOFIT</a></p>
      )}

      <div className="acoes">
        <h3>💳 Comprar Plano</h3>
        <a className="botao-compra" href="https://pag.ae/7-zv3gYqh" target="_blank">Comprar Treino Único</a>
        <a className="botao-compra" href="https://pag.ae/7-zv3h4GVf" target="_blank">Comprar Consultoria Online</a>
      </div>

      <div className="upload-docs">
        <h3>📂 Upload de Documentos</h3>
        <input type="file" accept=".pdf,.doc,.jpg,.png" onChange={handleUpload} />
      </div>

      <div className="progresso">
        <h3>📊 Progresso e Metas</h3>
        <p>Treinos realizados: <strong>{historico.length}</strong></p>
        <p>Último treino: {historico[0]?.data?.split("T")[0] || "Nenhum ainda"}</p>
      </div>

      <div className="historico">
        <h3>🗒️ Histórico de Treinos</h3>
        {historico.length === 0 ? (
          <p>Nenhum histórico registrado ainda.</p>
        ) : (
          <ul>
            {historico.map((h, i) => (
              <li key={i}>{h.data?.split("T")[0]} - {h.tipo} - {h.detalhe}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="treinos-enviados">
        <h3>📁 Treinos Enviados em PDF</h3>
        {treinosPdf.length === 0 ? (
          <p>Nenhum treino PDF enviado ainda.</p>
        ) : (
          <ul>
            {treinosPdf.map((t, i) => (
              <li key={i}>
                {new Date(t.enviado_em).toLocaleDateString()} - 
                <a href={t.url_pdf} target="_blank" rel="noopener noreferrer"> {t.nome_arquivo}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="eventos">
        <h3>🗓️ Próximas Revisões</h3>
        {eventos.length === 0 ? (
          <p>Nenhuma revisão agendada.</p>
        ) : (
          <ul>
            {eventos.map((ev, i) => (
              <li key={i}>
                📌 {ev.titulo} - {new Date(ev.data).toLocaleDateString()}<br />
                📱 <strong>Adicione no seu calendário ou consulte o WhatsApp</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="contato">
        <h3>💌 Atendimento</h3>
        <a href="https://wa.me/5521987708652" target="_blank" rel="noopener noreferrer">Falar com suporte no WhatsApp</a>
      </div>

      <button className="logout-btn" onClick={logout}>Sair</button>
    </div>
  );
}
