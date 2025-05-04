import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Emagrecedores from './pages/Emagrecedores';
import Consultoria from './pages/Consultoria';
import LoginCadastroCliente from './pages/LoginCadastroCliente';
import DashboardCliente from './pages/DashboardCliente';
import CadastroCliente from './pages/CadastroCliente';
import PainelAdmin from './pages/PainelAdmin';
import Navbar from './components/Navbar';
import './styles.css';

// Página de fallback (opcional)
function NotFound() {
  return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Página não encontrada</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* 🌐 Público */}
        <Route path="/" element={<Home />} />
        <Route path="/emagrecedores" element={<Emagrecedores />} />
        <Route path="/consultoria" element={<Consultoria />} />

        {/* 👥 Cliente */}
        <Route path="/cliente" element={<LoginCadastroCliente />} />
        <Route path="/cadastro" element={<CadastroCliente />} />
        <Route path="/dashboard" element={<DashboardCliente />} />

        {/* 🔐 Admin */}
        <Route path="/admin" element={<PainelAdmin />} />

        {/* ❌ Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* 📱 Botão WhatsApp flutuante */}
      <a
        href="https://wa.me/5521987708652"
        className="btn-whatsapp-flutuante"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬 ESTÁ COM DÚVIDA? ME CHAME AQUI
      </a>
    </BrowserRouter>
  );
}

export default App;
