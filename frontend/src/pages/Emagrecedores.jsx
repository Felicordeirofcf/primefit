import React from 'react';
import './Emagrecedores.css';
import depo1 from '../assets/ozenfitdepoimento.jpg';
import depo2 from '../assets/ozenfitdepoimento2.jpg';
import ozenfitProduto from '../assets/Ozenfit-8-2.png';
import liftDepo from '../assets/Img-Mulher-Detox-1.png';
import liftProduto from '../assets/Lift-Home-1.png';

export default function Emagrecedores() {
  return (
    <div className="consultoria-page">
      <section className="consultoria-hero">
        <h1 className="hero-title animado destaque">💥 Emagreça com Saúde e Resultados Visíveis!</h1>
        <p className="hero-subtitle">Transforme seu corpo com suplementos naturais, acompanhamento profissional e planos personalizados.</p>
      </section>

      <section className="beneficios-section">
        <div className="beneficio-box">
          <h2>🔥 Ozenfit Caps</h2>
          <ul>
            <li>Redução de gordura localizada</li>
            <li>Controle de apetite e compulsão</li>
            <li>Melhora do metabolismo</li>
            <li>Ingredientes naturais e seguros</li>
          </ul>
        </div>

        <div className="beneficio-box">
          <h2>💪 Lift Detox Caps</h2>
          <ul>
            <li>Desintoxica o organismo</li>
            <li>Acelera a queima de gordura</li>
            <li>Auxilia na digestão</li>
            <li>Rico em antioxidantes e vitaminas</li>
          </ul>
        </div>
      </section>

      <section className="comparativo-section">
        <h2>🥇 Qual é o ideal para seu objetivo? Descubra agora!</h2>
        <p>O <strong>Ozenfit</strong> é a escolha certa para quem busca resultados rápidos no controle do apetite e perda de peso. Já o <strong>Lift Detox</strong> é ideal para quem quer limpar o organismo, acelerar o metabolismo e emagrecer com saúde.</p>
        <ul>
          <li>✅ Resultados visíveis em poucas semanas</li>
          <li>✅ Ingredientes 100% naturais e seguros</li>
          <li>✅ Clientes satisfeitos em todo o Brasil</li>
        </ul>
        <p>💬 Não sabe por onde começar? Escolha o que mais se encaixa no seu perfil ou fale com nossos especialistas!</p>
        <p className="bonus-text destaque">
          🏋️‍♀️ <strong>BÔNUS EXCLUSIVO!</strong><br />
          Ao adquirir qualquer plano, você recebe <strong>GRÁTIS</strong> um treino personalizado elaborado por personal trainer certificado pelo CREF.<br />
          Transforme seu corpo com orientação profissional!
        </p>
      </section>

      <section className="produto-section">
        <div className="produto">
          <div className="depoimentos lado-a-lado pequeno">
            <img src={depo1} alt="Depoimento Ozenfit 1" className="depoimento-img pequeno" />
            <img src={depo2} alt="Depoimento Ozenfit 2" className="depoimento-img pequeno" />
          </div>
          <img src={ozenfitProduto} alt="Produto Ozenfit" className="produto-img pequeno" />
          <a href="https://pay.braip.co/checkout/pla0wely/cheqx91d?pl=pla0wely&ck=cheqx91d&af=afi7g3pl7x&currency=BRL" className="btn-comprar" target="_blank" rel="noopener noreferrer">OZEN FIT CAPS 1 UNIDADE</a>
          <a href="https://pay.braip.co/ref?pl=plamln1r&ck=cheqx91d&af=afi7g3pl7x" className="btn-comprar" target="_blank" rel="noopener noreferrer">OZEN FIT CAPS 3 UNIDADES</a>
        </div>

        <div className="produto">
          <div className="video-wrapper pequeno">
            <iframe width="100%" height="215" src="https://www.youtube.com/embed/i9274HarmVg" title="Depoimento Emagrecimento" frameBorder="0" allowFullScreen></iframe>
          </div>
          <img src={liftProduto} alt="Produto Lift Detox" className="produto-img pequeno" />
          <a href="https://pay.braip.co/ref?pl=plag8o2v&ck=chew8wl8&af=afine79g1o" className="btn-comprar" target="_blank" rel="noopener noreferrer">1 POTE POR R$ 137,00</a>
          <a href="https://pay.braip.co/ref?pl=pla62g2l&ck=chew8wl8&af=afine79g1o" className="btn-comprar" target="_blank" rel="noopener noreferrer">COMPRE 2 LEVE 3 POR R$ 187,00</a>
        </div>
      </section>

      <div className="bonus-animado destaque-texto">
        🎁 <strong>Bônus:</strong> Ao adquirir qualquer plano, você ganha automaticamente um treino personalizado com personal trainer certificado pelo CREF.
      </div>

      {/* ✅ NOVA CHAMADA PARA AÇÃO COM WHATSAPP */}
      <section className="cta-section">
        <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>✅ Após efetuar a compra</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>
          Clique abaixo para agilizar seu treino personalizado com nosso time de especialistas.
        </p>
       
        {/* Botão do WhatsApp */}
        <a 
          href="https://wa.me/5521987708652" 
          className="btn-whatsapp" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '14px 28px',
            backgroundColor: '#25D366',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center'
          }}
        >
          💬 Clique aqui para agilizar seu treino personalizado
        </a>
      </section>
    </div>
  );
}
