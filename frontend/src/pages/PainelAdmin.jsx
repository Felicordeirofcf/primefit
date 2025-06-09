import { useEffect, useState } from "react";
import "./PainelAdmin.css";
import AdminChat from "../components/AdminChat"; // Importar o componente de chat

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
      // Simulação - Em um cenário real, buscaria da API
      // Adapte esta parte se a API real estiver disponível e configurada
      try {
        // Exemplo: const res = await fetch("https://primefit-production.up.railway.app/admin/clientes", { headers: { Authorization: `Bearer ${token}` } });
        // const data = await res.json();
        // setClientes(data);
        // Dados simulados por enquanto:
        setClientes([
          { email: 'cliente1@example.com', nome: 'Cliente Um' },
          { email: 'cliente2@example.com', nome: 'Cliente Dois' },
        ]);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        alert("❌ Falha ao carregar os clientes.");
      } finally {
        setLoading(false);
      }
    }
    carregarClientes();
  }, [token]);

  // 🔄 Buscar treinos enviados para o cliente (simulado)
  useEffect(() => {
    if (!clienteSelecionado) {
        setTreinosEnviados([]);
        return;
    }
    // Simulação
    setTreinosEnviados([
        { nome_arquivo: 'treino_peito.pdf', url_pdf: '#', enviado_em: new Date().toISOString() },
        { nome_arquivo: 'treino_perna.pdf', url_pdf: '#', enviado_em: new Date(Date.now() - 86400000).toISOString() }, // Ontem
    ]);

  }, [clienteSelecionado, token]);

  // 📤 Enviar link do treino (simulado)
  const handleEnviarTreino = async () => {
    if (!clienteSelecionado || !linkTreino) {
      alert("⚠️ Selecione um cliente e informe o link do treino.");
      return;
    }
    console.log(`Enviando treino ${linkTreino} para ${clienteSelecionado}`);
    alert("✅ (Simulado) Treino enviado com sucesso!");
    setLinkTreino("");
  };

  // 📂 Upload do PDF para Supabase (simulado)
  const handleUploadPDF = async () => {
    if (!clienteSelecionado || !arquivoPDF) {
      alert("⚠️ Selecione um cliente e um arquivo PDF.");
      return;
    }
    console.log(`Fazendo upload de ${arquivoPDF.name} para ${clienteSelecionado}`);
    alert(`✅ (Simulado) PDF enviado com sucesso!\nLink: fake-link/${arquivoPDF.name}`);
    setTreinosEnviados((prev) => [
        { nome_arquivo: arquivoPDF.name, url_pdf: `#fake/${arquivoPDF.name}`, enviado_em: new Date().toISOString() },
        ...prev,
      ]);
    setArquivoPDF(null);
    // Limpar o input file visualmente (opcional)
    const inputFile = document.querySelector("input[type=\"file\"]");
    if (inputFile) inputFile.value = "";

  };

  // 📅 Agendar revisão (simulado)
  const handleAgendarRevisao = async () => {
    if (!clienteSelecionado || !dataRevisao) {
      alert("⚠️ Selecione o cliente e a data da revisão.");
      return;
    }
    console.log(`Agendando revisão para ${clienteSelecionado} em ${dataRevisao}`);
    alert("✅ (Simulado) Revisão agendada com sucesso!");
    setDataRevisao("");
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>🔄 Carregando painel...</p>;
  }

  return (
    <div className="painel-admin p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">📋 Painel Administrativo</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Coluna de Ações */}
        <div className="space-y-6">
          <div className="card-admin bg-white p-5 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-2">👤 Selecione o cliente:</label>
            <select
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
              className="input w-full"
            >
              <option value="">-- Selecione --</option>
              {clientes.map((c) => (
                <option key={c.email} value={c.email}>
                  {c.nome} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="card-admin bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">📎 Enviar link do treino (MFIT/TECNOFIT)</h3>
            <input
              type="text"
              value={linkTreino}
              onChange={(e) => setLinkTreino(e.target.value)}
              placeholder="Cole o link aqui..."
              className="input w-full mb-3"
              disabled={!clienteSelecionado}
            />
            <button onClick={handleEnviarTreino} className="btn btn-primary w-full" disabled={!clienteSelecionado || !linkTreino}>
              📤 Enviar Link
            </button>
          </div>

          <div className="card-admin bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">📂 Upload PDF do Treino</h3>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setArquivoPDF(e.target.files[0])}
              className="input w-full mb-3"
              disabled={!clienteSelecionado}
            />
            <button onClick={handleUploadPDF} className="btn btn-primary w-full" disabled={!clienteSelecionado || !arquivoPDF}>
              📤 Upload PDF
            </button>
          </div>

           <div className="card-admin bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">🗓️ Agendar Revisão de Série</h3>
            <input
              type="date"
              value={dataRevisao}
              onChange={(e) => setDataRevisao(e.target.value)}
              className="input w-full mb-3"
              disabled={!clienteSelecionado}
            />
            <button onClick={handleAgendarRevisao} className="btn btn-primary w-full" disabled={!clienteSelecionado || !dataRevisao}>
              📅 Agendar Revisão
            </button>
          </div>
        </div>

        {/* Coluna de Informações e Chat */}
        <div className="space-y-6">
          <div className="card-admin bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">📁 Treinos enviados para {clienteSelecionado || "cliente"}</h3>
            {clienteSelecionado ? (
                treinosEnviados.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum PDF enviado para este cliente.</p>
                ) : (
                <ul className="list-disc list-inside space-y-1 text-sm">
                    {treinosEnviados.map((t, i) => (
                    <li key={i}>
                        <a href={t.url_pdf} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        📎 {t.nome_arquivo}
                        </a>
                        <span className="text-gray-500 text-xs ml-2">
                         ({new Date(t.enviado_em).toLocaleDateString()})
                        </span>
                    </li>
                    ))}
                </ul>
                )
            ) : (
                 <p className="text-gray-500 text-sm">Selecione um cliente para ver os treinos enviados.</p>
            )}
          </div>

          {/* --- Integração do Chat --- */}
          <div className="card-admin bg-white rounded-lg shadow overflow-hidden">
             {/* O componente AdminChat agora será renderizado aqui */}
             {/* Ele precisa do contexto de autenticação para funcionar */}
             <AdminChat />
          </div>
           {/* --- Fim da Integração do Chat --- */}
        </div>
      </div>

    </div>
  );
}

