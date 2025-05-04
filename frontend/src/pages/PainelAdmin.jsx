import { useEffect, useState } from "react";
import "./PainelAdmin.css";

export default function PainelAdmin() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [linkTreino, setLinkTreino] = useState("");
  const [dataRevisao, setDataRevisao] = useState("");
  const [arquivoPDF, setArquivoPDF] = useState(null);
  const [treinosEnviados, setTreinosEnviados] = useState([]);
  const token = localStorage.getItem("token");

  // 🔁 Carregar lista de clientes
  useEffect(() => {
    async function carregarClientes() {
      try {
        const res = await fetch("http://localhost:8000/admin/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao buscar clientes");
        const data = await res.json();

        if (Array.isArray(data)) {
          setClientes(data);
        } else {
          alert("❌ Resposta inesperada da API.");
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        alert("❌ Falha ao carregar os clientes.");
      } finally {
        setLoading(false);
      }
    }

    carregarClientes();
  }, [token]);

  // 🔄 Buscar treinos enviados para o cliente
  useEffect(() => {
    async function carregarTreinos() {
      if (!clienteSelecionado) return;
      try {
        const res = await fetch(
          `http://localhost:8000/admin/treinos-enviados?cliente_email=${clienteSelecionado}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setTreinosEnviados(data || []);
      } catch (error) {
        console.error("Erro ao carregar treinos:", error);
      }
    }

    carregarTreinos();
  }, [clienteSelecionado, token]);

  // 📤 Enviar link do treino
  const handleEnviarTreino = async () => {
    if (!clienteSelecionado || !linkTreino) {
      alert("⚠️ Selecione um cliente e informe o link do treino.");
      return;
    }

    const treino = {
      link_app: linkTreino,
      plano: "personalizado",
    };

    try {
      const res = await fetch(`http://localhost:8000/admin/enviar-treino/${clienteSelecionado}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(treino),
      });

      alert(res.ok ? "✅ Treino enviado com sucesso!" : "❌ Erro ao enviar treino.");
    } catch (err) {
      console.error("Erro ao enviar treino:", err);
      alert("❌ Falha ao enviar o treino.");
    }
  };

  // 📂 Upload do PDF para Supabase
  const handleUploadPDF = async () => {
    if (!clienteSelecionado || !arquivoPDF) {
      alert("⚠️ Selecione um cliente e um arquivo PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", arquivoPDF);
    formData.append("cliente_email", clienteSelecionado); // 👈 incluído

    try {
      const res = await fetch("http://localhost:8000/admin/upload-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erro ao enviar PDF");
      }

      alert(`✅ PDF enviado com sucesso!\nLink: ${data.url}`);
      setArquivoPDF(null);
      setTreinosEnviados((prev) => [
        { nome_arquivo: arquivoPDF.name, url_pdf: data.url, enviado_em: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert(`❌ Erro ao enviar PDF: ${err.message}`);
    }
  };

  // 📅 Agendar revisão
  const handleAgendarRevisao = async () => {
    if (!clienteSelecionado || !dataRevisao) {
      alert("⚠️ Selecione o cliente e a data da revisão.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/admin/agendar-revisao", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_cliente: clienteSelecionado,
          data: dataRevisao,
        }),
      });

      alert(res.ok ? "✅ Revisão agendada com sucesso!" : "❌ Erro ao agendar revisão.");
    } catch (err) {
      console.error("Erro ao agendar revisão:", err);
      alert("❌ Falha ao agendar a revisão.");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>🔄 Carregando clientes...</p>;
  }

  return (
    <div className="painel-admin">
      <h2>📋 Painel Administrativo</h2>

      <label>👤 Selecione o cliente:</label>
      <select
        value={clienteSelecionado}
        onChange={(e) => setClienteSelecionado(e.target.value)}
      >
        <option value="">-- Selecione --</option>
        {clientes.map((c) => (
          <option key={c.email} value={c.email}>
            {c.nome} ({c.email})
          </option>
        ))}
      </select>

      <div className="card-admin">
        <h3>📎 Enviar link do treino (MFIT/TECNOFIT)</h3>
        <input
          type="text"
          value={linkTreino}
          onChange={(e) => setLinkTreino(e.target.value)}
          placeholder="https://..."
        />
        <button onClick={handleEnviarTreino}>📤 Enviar Treino</button>
      </div>

      <div className="card-admin">
        <h3>📂 Upload PDF do Treino</h3>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setArquivoPDF(e.target.files[0])}
        />
        <button onClick={handleUploadPDF}>📤 Upload PDF</button>
      </div>

      <div className="card-admin">
        <h3>📁 Treinos enviados</h3>
        {treinosEnviados.length === 0 ? (
          <p>Nenhum PDF enviado para este cliente.</p>
        ) : (
          <ul>
            {treinosEnviados.map((t, i) => (
              <li key={i}>
                <a href={t.url_pdf} target="_blank" rel="noreferrer">
                  📎 {t.nome_arquivo}
                </a>{" "}
                — {new Date(t.enviado_em).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-admin">
        <h3>🗓️ Agendar Revisão de Série</h3>
        <input
          type="date"
          value={dataRevisao}
          onChange={(e) => setDataRevisao(e.target.value)}
        />
        <button onClick={handleAgendarRevisao}>📅 Agendar</button>
      </div>
    </div>
  );
}
