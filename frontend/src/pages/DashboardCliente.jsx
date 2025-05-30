import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './DashboardCliente.css';
// Assuming a Spinner component exists or can be created/imported
// import Spinner from '../components/common/Spinner'; 

export default function DashboardCliente() {
  const [cliente, setCliente] = useState(null);
  const [isLoadingCliente, setIsLoadingCliente] = useState(true); // Loading state for client data
  const [historico, setHistorico] = useState([]);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false); // Loading state for historico
  const [eventos, setEventos] = useState([]);
  const [isLoadingEventos, setIsLoadingEventos] = useState(false); // Loading state for eventos
  const [treinosPdf, setTreinosPdf] = useState([]);
  const [isLoadingTreinosPdf, setIsLoadingTreinosPdf] = useState(false); // Loading state for treinosPdf
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch Client Data
  useEffect(() => {
    if (!token) {
      navigate("/cliente");
      return;
    }

    setIsLoadingCliente(true); // Start loading client data
    fetch("http://localhost:8000/auth/clientes/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem("token"); // Clear invalid token
          throw new Error("Token inválido ou expirado");
        }
        return res.json();
      })
      .then(data => {
        setCliente(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do cliente:", err.message);
        navigate("/cliente"); // Redirect on error
      })
      .finally(() => {
        setIsLoadingCliente(false); // Finish loading client data
      });
  }, [token, navigate]);

  // Fetch Secondary Data (Historico, Eventos, Treinos)
  useEffect(() => {
    // Only run if client data is loaded and email exists
    if (!cliente?.email || isLoadingCliente) return; 

    // --- Histórico ---
    setIsLoadingHistorico(true);
    fetch(`http://localhost:8000/admin/historico/${encodeURIComponent(cliente.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setHistorico(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Erro ao buscar histórico:", err.message);
        setHistorico([]); // Set empty on error
      })
      .finally(() => setIsLoadingHistorico(false));

    // --- Eventos ---
    setIsLoadingEventos(true);
    fetch(`http://localhost:8000/admin/eventos/${encodeURIComponent(cliente.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setEventos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Erro ao buscar eventos:", err.message);
        setEventos([]); // Set empty on error
      })
      .finally(() => setIsLoadingEventos(false));

    // --- Treinos enviados em PDF ---
    setIsLoadingTreinosPdf(true);
    fetch(`http://localhost:8000/cliente/treinos-enviados?cliente_email=${encodeURIComponent(cliente.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setTreinosPdf(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Erro ao buscar treinos PDF:", err.message);
        setTreinosPdf([]); // Set empty on error
      })
      .finally(() => setIsLoadingTreinosPdf(false));

  }, [cliente, token, isLoadingCliente]); // Depend on cliente, token, and isLoadingCliente

  const logout = () => {
    localStorage.removeItem("token");
    setCliente(null); // Clear client state on logout
    navigate("/cliente");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    // Ensure client data is loaded before allowing upload
    if (!file || !cliente?.email || isLoadingCliente) return; 

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", cliente.email); 

    try {
      // Consider adding a loading state for the upload itself
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

  // Initial loading state for the whole page based on client data fetch
  if (isLoadingCliente) {
    // Replace with a proper Spinner component if available
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Carregando dados do usuário...</p></div>; 
  }

  // Handle case where client data fetch finished but failed (cliente is still null)
  // This case should ideally be handled by the redirect in the catch block, but as a fallback:
  if (!cliente) {
     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Não foi possível carregar os dados. Tente fazer login novamente.</p></div>;
  }

  // Render the dashboard content once client data is loaded
  return (
    <div className="dashboard-cliente">
      {/* Header section - Renders immediately after cliente is loaded */}
      <h2>Bem-vindo(a), {cliente.nome}</h2>
      <p><strong>Plano:</strong> {cliente.plano || "nenhum"}</p>
      <p><strong>Status:</strong> {cliente.status_plano || "inativo"}</p>
      {cliente.link_app && (
        <p><strong>Treino App:</strong> <a href={cliente.link_app} target="_blank" rel="noopener noreferrer">Acessar MFIT/TECNOFIT</a></p>
      )}

      {/* Ações Section */}
      <div className="acoes">
        <h3>💳 Comprar Plano</h3>
        <a className="botao-compra" href="https://pag.ae/7-zv3gYqh" target="_blank" rel="noopener noreferrer">Comprar Treino Único</a>
        <a className="botao-compra" href="https://pag.ae/7-zv3h4GVf" target="_blank" rel="noopener noreferrer">Comprar Consultoria Online</a>
      </div>

      {/* Upload Section */}
      <div className="upload-docs">
        <h3>📂 Upload de Documentos</h3>
        <input type="file" accept=".pdf,.doc,.jpg,.png" onChange={handleUpload} />
      </div>

      {/* Progresso Section - Uses historico data */}
      <div className="progresso">
        <h3>📊 Progresso e Metas</h3>
        {isLoadingHistorico ? (
          <p>Carregando progresso...</p> // Or use a Spinner component
        ) : (
          <>
            <p>Treinos realizados: <strong>{historico.length}</strong></p>
            <p>Último treino: {historico[0]?.data?.split("T")[0] || "Nenhum ainda"}</p>
          </>
        )}
      </div>

      {/* Histórico Section */}
      <div className="historico">
        <h3>🗒️ Histórico de Treinos</h3>
        {isLoadingHistorico ? (
          <p>Carregando histórico...</p> // Or use a Spinner component
        ) : historico.length === 0 ? (
          <p>Nenhum histórico registrado ainda.</p>
        ) : (
          <ul>
            {historico.map((h, i) => (
              <li key={i}>{h.data?.split("T")[0]} - {h.tipo} - {h.detalhe}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Treinos Enviados Section */}
      <div className="treinos-enviados">
        <h3>📁 Treinos Enviados em PDF</h3>
        {isLoadingTreinosPdf ? (
          <p>Carregando treinos...</p> // Or use a Spinner component
        ) : treinosPdf.length === 0 ? (
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

      {/* Eventos Section */}
      <div className="eventos">
        <h3>🗓️ Próximas Revisões</h3>
        {isLoadingEventos ? (
          <p>Carregando revisões...</p> // Or use a Spinner component
        ) : eventos.length === 0 ? (
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

      {/* Contato Section */}
      <div className="contato">
        <h3>💌 Atendimento</h3>
        <a href="https://wa.me/5521987708652" target="_blank" rel="noopener noreferrer">Falar com suporte no WhatsApp</a>
      </div>

      {/* Logout Button */}
      <button className="logout-btn" onClick={logout}>Sair</button>
    </div>
  );
}

