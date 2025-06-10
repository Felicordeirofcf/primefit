import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { profilesAPI, adminAPI, trainingsAPI, authAPI } from "../api/apiClient";
import './DashboardCliente.css';
// Assuming a Spinner component exists or can be created/imported
// import Spinner from '../components/common/Spinner'; 

export default function DashboardCliente() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [cliente, setCliente] = useState(null);
  const [isLoadingCliente, setIsLoadingCliente] = useState(true); // Loading state for client data
  const [historico, setHistorico] = useState([]);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false); // Loading state for historico
  const [eventos, setEventos] = useState([]);
  const [isLoadingEventos, setIsLoadingEventos] = useState(false); // Loading state for eventos
  const [treinosPdf, setTreinosPdf] = useState([]);
  const [isLoadingTreinosPdf, setIsLoadingTreinosPdf] = useState(false); // Loading state for treinosPdf
  
  const navigate = useNavigate();

  // Fetch Client Data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    const fetchClientData = async () => {
      setIsLoadingCliente(true); // Start loading client data
      try {
        const { data, error } = await profilesAPI.getMyProfile();
        if (error) {
          console.error("Erro ao buscar dados do cliente:", error);
          // If 401, apiClient interceptor will handle redirect
          if (error.response?.status !== 401) {
            navigate("/login"); // Redirect on other errors
          }
        } else {
          setCliente(data);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar dados do cliente:", err);
        navigate("/login"); // Redirect on unexpected errors
      } finally {
        setIsLoadingCliente(false); // Finish loading client data
      }
    };

    fetchClientData();
  }, [isAuthenticated, navigate]);

  // Fetch Secondary Data (Historico, Eventos, Treinos)
  useEffect(() => {
    // Only run if client data is loaded and email exists
    if (!cliente?.email || isLoadingCliente) return; 

    const fetchSecondaryData = async () => {
      // --- Histórico ---
      setIsLoadingHistorico(true);
      try {
        const { data, error } = await adminAPI.getHistorico(cliente.email);
        if (error) {
          console.error("Erro ao buscar histórico:", error);
          setHistorico([]); // Set empty on error
        } else {
          setHistorico(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar histórico:", err);
        setHistorico([]);
      } finally {
        setIsLoadingHistorico(false);
      }

      // --- Eventos ---
      setIsLoadingEventos(true);
      try {
        const { data, error } = await adminAPI.getEventos(cliente.email);
        if (error) {
          console.error("Erro ao buscar eventos:", error);
          setEventos([]); // Set empty on error
        } else {
          setEventos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar eventos:", err);
        setEventos([]);
      } finally {
        setIsLoadingEventos(false);
      }

      // --- Treinos enviados em PDF ---
      setIsLoadingTreinosPdf(true);
      try {
        const { data, error } = await trainingsAPI.getSentTrainings(cliente.email);
        if (error) {
          console.error("Erro ao buscar treinos PDF:", error);
          setTreinosPdf([]); // Set empty on error
        } else {
          setTreinosPdf(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar treinos PDF:", err);
        setTreinosPdf([]);
      } finally {
        setIsLoadingTreinosPdf(false);
      }
    };

    fetchSecondaryData();
  }, [cliente, isLoadingCliente]); // Depend on cliente and isLoadingCliente

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    // Ensure client data is loaded before allowing upload
    if (!file || !cliente?.email || isLoadingCliente) return; 

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", cliente.email); 

    try {
      const { data, error } = await authAPI.uploadDocs(formData);
      if (error) {
        alert(`❌ Erro ao enviar arquivo: ${error.message || error}`);
      } else {
        alert("✅ Arquivo enviado com sucesso!");
        // Optionally re-fetch treinosPdf to show the new upload
        // You might want to implement a more robust state management for this
      }
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
      <button className="logout-btn" onClick={handleLogout}>Sair</button>
    </div>
  );
}


