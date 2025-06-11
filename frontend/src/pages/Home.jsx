import React, { useEffect, useState } from 'react';
import './Emagrecedores.css';
import { Link } from 'react-router-dom';
import logo from '../assets/primelogo.png';
import produto1 from '../assets/ozenfitdepoimento.jpg';
import produto2 from '../assets/ozenfitdepoimento2.jpg';
import ChatBot from '../components/ChatBot';

export default function Home() {
  const imagens = [produto1, produto2];
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setImagemAtual((prev) => (prev + 1) % imagens.length);
    }, 3000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="consultoria-page">
      <div className="consultoria-hero">
        <h1>Bem-vindo à <span style={{ color: '#ffeb3b' }}>PRIME FIT CONSULTING</span></h1>
        <p>
          A <strong>PRIME FIT CONSULTING</strong> é referência em saúde, estética e bem-estar. <br />
          Combinamos produtos naturais de alta qualidade com consultorias fitness personalizadas, <br />
          integrando tecnologia de ponta via apps como MFIT e Tecnofit. <br />
          Nosso objetivo é oferecer uma experiência completa para você atingir seus resultados com eficiência e segurança.
        </p>
      </div>

      <section className="beneficios-section">
        <div className="beneficio-box">
          <h2>💼 Nossos Serviços</h2>
          <ul>
            <li>🌱 Venda de suplementos naturais certificados e aprovados</li>
            <li>🤝 Consultoria online com personal trainers experientes e credenciados</li>
            <li>📲 Programas personalizados via aplicativo (MFIT, Tecnofit e similares)</li>
            <li>🎯 Planos sob medida para emagrecimento, performance e bem-estar</li>
          </ul>
        </div>

        {/* 🔄 CARROSSEL de produtos */}
        <div className="carrossel-box">
          <img 
            src={imagens[imagemAtual]} 
            alt="Produto em destaque" 
            className="img-carrossel" 
          />
          <Link to="/emagrecedores" className="btn-emagrecedores">
            💊 Venha conhecer nossos emagrecedores
          </Link>
        </div>

        <div className="beneficio-box">
          <h2>✅ Por que escolher a PRIME FIT CONSULTING?</h2>
          <ul>
            <li>🏅 Mais de 50 clientes satisfeitos em todo o Brasil</li>
            <li>🧬 Produtos naturais, seguros e com respaldo científico</li>
            <li>📈 Planos e metas adaptadas ao seu ritmo e objetivo</li>
            <li>🤖 Tecnologia a seu favor: acompanhamento via app</li>
            <li>📞 Suporte humano e rápido para tirar dúvidas sempre que precisar</li>
          </ul>
        </div>
      </section>

      <section className="produto-section">
        <div className="produto">
          <h3>📦 Treino ÚNICO</h3>
          <p>Ideal para quem quer testar e começar sua transformação.</p>
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

        <div className="produto">
          <h3>📊 Consultoria Completa</h3>
          <p>Inclui acompanhamento semanal, metas personalizadas e suporte completo.</p>
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

      <section className="comparativo-section">
        <h2>💬 O que nossos clientes dizem:</h2>
        <blockquote>
          <p>“Consegui eliminar 8kg em 2 meses com os produtos da PRIME FIT e ainda ganhei mais disposição no dia a dia!”</p>
          <footer>— Juliana M., São Paulo - SP</footer>
        </blockquote>
        <blockquote>
          <p>“O acompanhamento pelo aplicativo é incrível! Me senti motivado todos os dias.”</p>
          <footer>— Ricardo T., Belo Horizonte - MG</footer>
        </blockquote>
        <blockquote>
          <p>“Já testei várias coisas antes e nada funcionava. Com a PRIME FIT tive resultado logo nas primeiras semanas.”</p>
          <footer>— Camila R., Curitiba - PR</footer>
        </blockquote>
      </section>
      
      {/* Chatbot de Pré-venda */}
      <ChatBot type="pre-venda" />
    </div>
  );
}
