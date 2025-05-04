import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

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

// 📊 GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-JZSPT4951W';

// 🚀 Carrega o script do gtag.js
function loadGtagScript() {
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `;
  document.head.appendChild(script2);
}

// 🎯 Rastreia cada mudança de rota como pageview
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

// 🧩 Página de fallback (opcional)
function NotFound() {
  return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Página não encontrada</h2>;
}

// 🚀 Início da aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));

// Carrega o GA ao iniciar
loadGtagScript();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🎯 Ativa rastreamento GA4 */}
      <Analytics />

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
