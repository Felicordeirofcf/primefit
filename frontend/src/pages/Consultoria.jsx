import React from 'react';
import './Consultoria.css';

export default function Consultoria() {
  return (
    <div className="consultoria-page">
      <section className="consultoria-hero destaque">
        <h1 className="hero-title animado destaque">💼 Consultoria Online de Treino e Nutrição</h1>
        <p className="hero-subtitle">Alcance seus objetivos com acompanhamento profissional onde você estiver!</p>
      </section>

      <section className="linha-consultoria">
  {/* Benefícios */}
  <div className="card-consultoria">
    <h2>✅ Benefícios da nossa Consultoria</h2>
    <ul>
      <li>🎯 Treinos personalizados conforme seu objetivo</li>
      <li>🥗 Planos alimentares adaptados à sua rotina</li>
      <li>📱 Acompanhamento via app (MFIT / Tecnofit)</li>
      <li>📊 Relatórios de evolução mensais</li>
      <li>🤝 Contato direto com profissionais especializados</li>
    </ul>
  </div>

  {/* Plano Treino Único */}
  <div className="card-consultoria">
    <h3>📦 Treino ÚNICO</h3>
    <p>Para quem quer iniciar com um plano direto e eficaz.</p>
    <ul>
      <li>✔️ Treino completo com base em seus dados</li>
      <li>✔️ PDF com instruções por grupo muscular</li>
      <li>✔️ Sem acompanhamento pós-compra</li>
    </ul>
    <p><strong>R$ 80,00</strong></p>
    <a 
      href="https://pag.ae/7_Ceu3LTQ/button" 
      target="_blank" 
      rel="noopener noreferrer"
      title="Pagar com PagBank"
    >
      <img 
        src="//assets.pagseguro.com.br/ps-integration-assets/botoes/pagamentos/205x30-pagar-preto.gif" 
        alt="Pague com PagBank - é rápido, grátis e seguro!" 
      />
    </a>
  </div>

  {/* Plano Consultoria Completa */}
  <div className="card-consultoria">
    <h3>📊 Consultoria Completa</h3>
    <p>Para quem deseja acompanhamento constante com ajustes semanais.</p>
    <ul>
      <li>✔️ Treino ajustado conforme sua evolução</li>
      <li>✔️ Avaliação inicial com análise de perfil</li>
      <li>✔️ Acesso a app com vídeos e metas</li>
      <li>✔️ Reavaliações semanais</li>
      <li>✔️ Suporte via WhatsApp incluso</li>
    </ul>
    <p><strong>R$ 150,00</strong></p>
    <a 
      href="https://pag.ae/7_CeunDew/button" 
      target="_blank" 
      rel="noopener noreferrer"
      title="Pagar com PagBank"
    >
      <img 
        src="//assets.pagseguro.com.br/ps-integration-assets/botoes/pagamentos/205x30-pagar-preto.gif" 
        alt="Pague com PagBank - é rápido, grátis e seguro!" 
      />
    </a>
  </div>
</section>
<div className="btn-whatsapp-box">
  <a
    href="https://wa.me/5521987708652"
    className="btn-falar-personal"
    target="_blank"
    rel="noopener noreferrer"
  >
    💬 FALAR COM UM PERSONAL TRAINER
  </a>
</div>

    </div>
  );
}
