import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 🌐 Páginas públicas
import Home from './pages/Home';
import Emagrecedores from './pages/Emagrecedores';
import Consultoria from './pages/Consultoria';

// 👥 Páginas do cliente
import LoginCadastroCliente from './pages/LoginCadastroCliente';
import DashboardCliente from './pages/DashboardCliente';
import CadastroCliente from './pages/CadastroCliente';

// 🔐 Painel do admin
import PainelAdmin from './pages/PainelAdmin';

// 🔝 Componentes globais
import Navbar from './components/Navbar';
import './styles.css'; // CSS global

// 🧩 Página de fallback (opcional)
function NotFound() {
  return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Página não encontrada</h2>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* 🌐 Público */}
        <Route path="/" element={<Home />} />
        <Route path="/emagrecedores" element={<Emagrecedores />} />
        <Route path="/consultoria" element={<Consultoria />} />

        {/* 👥 Cliente */}
        <Route path="/cliente" element={<LoginCadastroCliente />} />
        <Route path="/dashboard" element={<DashboardCliente />} />
        <Route path="/cadastro" element={<CadastroCliente />} />

        {/* 🔐 Admin */}
        <Route path="/admin" element={<PainelAdmin />} />

        {/* ❌ Página não encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ✅ Botão flutuante do WhatsApp visível em todas as rotas */}
      <a
        href="https://wa.me/5521987708652"
        className="btn-whatsapp-flutuante"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬 ESTÁ COM DÚVIDA? ME CHAME AQUI
      </a>
    </BrowserRouter>
  </React.StrictMode>
);
