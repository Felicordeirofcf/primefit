import React from 'react'
import { Link } from 'react-router-dom'

const WeightLossPage = () => {
  // Dados simulados de depoimentos
  const testimonials = [
    {
      id: 1,
      name: 'Carla Silva',
      age: 34,
      weightLost: '15kg',
      timeFrame: '4 meses',
      quote: 'O PrimeFit mudou completamente minha relação com exercícios e alimentação. O acompanhamento personalizado fez toda a diferença para manter a motivação e alcançar meus objetivos.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
    },
    {
      id: 2,
      name: 'Rafael Oliveira',
      age: 42,
      weightLost: '22kg',
      timeFrame: '6 meses',
      quote: 'Depois de tentar várias dietas sem sucesso, encontrei no PrimeFit um método que realmente funciona. O dashboard me ajuda a manter o foco e ver meu progresso diariamente.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    {
      id: 3,
      name: 'Mariana Costa',
      age: 28,
      weightLost: '18kg',
      timeFrame: '5 meses',
      quote: 'O que mais gostei foi a abordagem personalizada. Meu plano foi adaptado às minhas necessidades e limitações, tornando o processo de emagrecimento muito mais natural e sustentável.',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transforme seu corpo e sua vida com o programa de emagrecimento PrimeFit
            </h1>
            <p className="text-xl mb-8">
              Resultados reais e duradouros com acompanhamento personalizado, baseado em ciência e adaptado ao seu estilo de vida.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/cadastro" className="btn bg-accent-500 hover:bg-accent-600 text-white">
                Começar Agora
              </Link>
              <a href="#como-funciona" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Como Funciona
              </a>
            </div>
          </div>
        </div>
        
        {/* Wave shape divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Estatísticas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">94%</div>
              <p className="text-gray-600">dos nossos clientes atingem suas metas de emagrecimento</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">+15kg</div>
              <p className="text-gray-600">é a média de perda de peso dos nossos clientes em 6 meses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">+1000</div>
              <p className="text-gray-600">vidas transformadas através do nosso método</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nosso programa de emagrecimento é baseado em uma abordagem científica e personalizada,
              adaptada às suas necessidades e objetivos específicos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Avaliação Completa</h3>
              <p className="text-gray-600">
                Realizamos uma avaliação física e nutricional detalhada para entender seu corpo,
                histórico, limitações e objetivos específicos.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Plano Personalizado</h3>
              <p className="text-gray-600">
                Desenvolvemos um plano de treino e nutrição totalmente personalizado,
                adaptado ao seu estilo de vida, preferências e necessidades.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Acompanhamento Contínuo</h3>
              <p className="text-gray-600">
                Monitoramos seu progresso através do nosso dashboard exclusivo, com ajustes
                periódicos e suporte constante para garantir resultados.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Diferenciais */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o PrimeFit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nosso método se destaca por combinar ciência, tecnologia e acompanhamento personalizado
              para garantir resultados reais e duradouros.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Abordagem Baseada em Ciência</h3>
                    <p className="text-gray-600">
                      Nossos métodos são fundamentados em pesquisas científicas atualizadas,
                      garantindo eficácia e segurança no processo de emagrecimento.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Personalização Total</h3>
                    <p className="text-gray-600">
                      Cada plano é único, desenvolvido especificamente para você, considerando
                      seu metabolismo, preferências alimentares e rotina.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Acompanhamento Tecnológico</h3>
                    <p className="text-gray-600">
                      Nosso dashboard exclusivo permite que você acompanhe seu progresso em tempo real,
                      mantendo a motivação e facilitando ajustes quando necessário.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Resultados Sustentáveis</h3>
                    <p className="text-gray-600">
                      Focamos em mudanças de hábitos duradouras, não em dietas restritivas temporárias,
                      garantindo que os resultados sejam mantidos a longo prazo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Equipe Multidisciplinar</h3>
                    <p className="text-gray-600">
                      Contamos com profissionais especializados em diversas áreas, incluindo educadores físicos,
                      nutricionistas e psicólogos, para um acompanhamento completo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Suporte Contínuo</h3>
                    <p className="text-gray-600">
                      Oferecemos suporte constante através de diversos canais, garantindo que você
                      nunca se sinta sozinho em sua jornada de transformação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Depoimentos */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Histórias de Sucesso</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça algumas das pessoas que transformaram seus corpos e suas vidas com o método PrimeFit.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="card overflow-hidden">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{testimonial.name}, {testimonial.age}</h3>
                      <p className="text-primary-600 font-medium">Perdeu {testimonial.weightLost} em {testimonial.timeFrame}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <a href="#" className="text-primary-600 font-medium hover:text-primary-700">
                    Ver história completa →
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/blog" className="btn btn-outline">
              Ver Mais Histórias
            </Link>
          </div>
        </div>
      </section>
      
      {/* Planos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Planos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano que melhor se adapta às suas necessidades e objetivos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plano Básico */}
            <div className="card p-6 border-t-4 border-gray-400">
              <h3 className="text-xl font-bold mb-2">Plano Básico</h3>
              <div className="text-3xl font-bold mb-4">R$ 100<span className="text-lg font-normal text-gray-500">/mês</span></div>
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
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Suporte por email
                </li>
              </ul>
              <button className="btn btn-outline w-full">Começar Agora</button>
            </div>
            
            {/* Plano Premium */}
            <div className="card p-6 border-t-4 border-primary-600 shadow-lg transform scale-105">
              <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">Popular</div>
              <h3 className="text-xl font-bold mb-2">Plano Premium</h3>
              <div className="text-3xl font-bold mb-4">R$ 150<span className="text-lg font-normal text-gray-500">/mês</span></div>
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
              <div className="text-3xl font-bold mb-4">R$ 200<span className="text-lg font-normal text-gray-500">/mês</span></div>
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
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tire suas dúvidas sobre nosso programa de emagrecimento.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
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
              <h3 className="text-lg font-bold mb-2">Preciso seguir uma dieta restritiva?</h3>
              <p className="text-gray-600">
                Não trabalhamos com dietas restritivas, mas sim com reeducação alimentar personalizada.
                Nosso objetivo é criar hábitos alimentares saudáveis e sustentáveis que se adaptem ao seu
                estilo de vida e preferências.
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
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar seu corpo?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Comece hoje mesmo sua jornada de transformação com o PrimeFit. Nossos especialistas estão prontos
            para te ajudar a alcançar seus objetivos de emagrecimento.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/cadastro" className="btn bg-white text-accent-600 hover:bg-gray-100">
              Começar Agora
            </Link>
            <Link to="/contato" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent-600">
              Falar com um Especialista
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WeightLossPage
