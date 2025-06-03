import React from 'react'

const ServicesPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Nossos Serviços</h1>
      
      {/* Introdução */}
      <div className="mb-12">
        <p className="text-lg mb-4">
          O PrimeFit oferece serviços especializados de consultoria em emagrecimento e transformação corporal,
          com foco em resultados reais e duradouros através de acompanhamento personalizado.
        </p>
      </div>
      
      {/* Serviços principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Serviço 1 */}
        <div className="card p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Consultoria de Emagrecimento</h3>
          <p className="text-gray-600 mb-4">
            Programa personalizado focado na perda de peso saudável e sustentável, com acompanhamento contínuo
            e ajustes baseados em resultados.
          </p>
          <ul className="text-gray-600 space-y-2 mb-4">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Avaliação física detalhada
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Plano de treino personalizado
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Orientação nutricional
            </li>
          </ul>
          <a href="/emagrecimento" className="text-primary-600 font-medium hover:text-primary-700">
            Saiba mais →
          </a>
        </div>
        
        {/* Serviço 2 */}
        <div className="card p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Treinamento Personalizado</h3>
          <p className="text-gray-600 mb-4">
            Planos de treino desenvolvidos especificamente para suas necessidades, objetivos e limitações,
            com acompanhamento e ajustes periódicos.
          </p>
          <ul className="text-gray-600 space-y-2 mb-4">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Treinos adaptados ao seu nível
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Progressão estruturada
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Vídeos explicativos dos exercícios
            </li>
          </ul>
          <a href="/servicos" className="text-primary-600 font-medium hover:text-primary-700">
            Saiba mais →
          </a>
        </div>
        
        {/* Serviço 3 */}
        <div className="card p-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Avaliação Física Completa</h3>
          <p className="text-gray-600 mb-4">
            Avaliação detalhada de composição corporal, condicionamento físico e outros parâmetros importantes
            para o acompanhamento de resultados.
          </p>
          <ul className="text-gray-600 space-y-2 mb-4">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Medidas antropométricas
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Cálculo de percentual de gordura
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Análise postural
            </li>
          </ul>
          <a href="/servicos" className="text-primary-600 font-medium hover:text-primary-700">
            Saiba mais →
          </a>
        </div>
      </div>
      
      {/* Planos */}
      <h2 className="text-2xl font-bold mb-6">Nossos Planos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Plano Básico */}
        <div className="card p-6 border-t-4 border-gray-400">
          <h3 className="text-xl font-bold mb-2">Plano Básico</h3>
          <div className="text-3xl font-bold mb-4">R$ 149<span className="text-lg font-normal text-gray-500">/mês</span></div>
          <p className="text-gray-600 mb-4">Ideal para quem está começando sua jornada de transformação.</p>
          <ul className="text-gray-600 space-y-2 mb-6">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Plano de treino mensal
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Avaliação física trimestral
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Acesso ao dashboard básico
            </li>
          </ul>
          <button className="btn btn-outline w-full">Começar Agora</button>
        </div>
        
        {/* Plano Premium */}
        <div className="card p-6 border-t-4 border-primary-600 shadow-lg transform scale-105">
          <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">Popular</div>
          <h3 className="text-xl font-bold mb-2">Plano Premium</h3>
          <div className="text-3xl font-bold mb-4">R$ 249<span className="text-lg font-normal text-gray-500">/mês</span></div>
          <p className="text-gray-600 mb-4">Nossa opção mais popular, com acompanhamento completo.</p>
          <ul className="text-gray-600 space-y-2 mb-6">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Plano de treino semanal
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Avaliação física mensal
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Orientação nutricional
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Acesso ao dashboard completo
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Suporte via chat
            </li>
          </ul>
          <button className="btn btn-primary w-full">Começar Agora</button>
        </div>
        
        {/* Plano VIP */}
        <div className="card p-6 border-t-4 border-accent-500">
          <h3 className="text-xl font-bold mb-2">Plano VIP</h3>
          <div className="text-3xl font-bold mb-4">R$ 399<span className="text-lg font-normal text-gray-500">/mês</span></div>
          <p className="text-gray-600 mb-4">Acompanhamento exclusivo e personalizado para resultados acelerados.</p>
          <ul className="text-gray-600 space-y-2 mb-6">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Plano de treino diário
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Avaliação física quinzenal
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Plano nutricional personalizado
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Acesso ao dashboard premium
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Suporte 24/7 via WhatsApp
            </li>
          </ul>
          <button className="btn btn-outline w-full">Começar Agora</button>
        </div>
      </div>
      
      {/* FAQ */}
      <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
      <div className="space-y-4 mb-12">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-2">Quanto tempo leva para ver resultados?</h3>
          <p className="text-gray-600">
            Os resultados variam de pessoa para pessoa, mas geralmente nossos clientes começam a notar mudanças
            visíveis após 4-6 semanas de acompanhamento consistente. Resultados mais significativos são
            observados após 3 meses.
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-2">Preciso ter experiência prévia com exercícios?</h3>
          <p className="text-gray-600">
            Não, nossos programas são adaptados para todos os níveis de experiência, desde iniciantes
            até praticantes avançados. Cada plano é personalizado considerando seu nível atual.
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-2">Como funciona o acompanhamento online?</h3>
          <p className="text-gray-600">
            Através do nosso dashboard exclusivo, você terá acesso aos seus treinos, avaliações e progresso.
            A comunicação com seu personal trainer é feita por chat, e-mail ou videochamadas, dependendo do
            seu plano.
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-2">Posso cancelar minha assinatura a qualquer momento?</h3>
          <p className="text-gray-600">
            Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais. Recomendamos
            um período mínimo de 3 meses para obter resultados significativos.
          </p>
        </div>
      </div>
      
      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Pronto para transformar seu corpo?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Comece hoje mesmo sua jornada de transformação com o PrimeFit. Nossos especialistas estão prontos
          para te ajudar a alcançar seus objetivos.
        </p>
        <button className="btn bg-white text-primary-600 hover:bg-gray-100">
          Agendar Consulta Gratuita
        </button>
      </div>
    </div>
  )
}

export default ServicesPage
