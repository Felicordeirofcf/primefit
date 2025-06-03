import React from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/images/hero-image.jpg'

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Transforme seu corpo, transforme sua vida
              </h1>
              <p className="text-xl mb-8">
                Consultoria especializada em emagrecimento com acompanhamento personalizado para resultados reais e duradouros.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/emagrecimento" className="btn bg-accent-500 hover:bg-accent-600 text-white">
                  Começar Agora
                </Link>
                <Link to="/sobre" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  Saiba Mais
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src={heroImage} 
                alt="Transformação física" 
                className="rounded-lg shadow-xl max-w-full h-auto md:max-w-lg lg:max-w-xl mx-auto"
              />
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
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o PrimeFit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa metodologia exclusiva combina treinos personalizados, acompanhamento nutricional e suporte contínuo para garantir resultados reais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Planos Personalizados</h3>
              <p className="text-gray-600">
                Cada plano é desenvolvido exclusivamente para você, considerando seus objetivos, limitações e preferências.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Acompanhamento Contínuo</h3>
              <p className="text-gray-600">
                Monitore seu progresso em tempo real com nosso dashboard exclusivo e receba feedback constante do seu personal trainer.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Resultados Comprovados</h3>
              <p className="text-gray-600">
                Nossa metodologia já ajudou centenas de pessoas a alcançarem seus objetivos de emagrecimento de forma saudável e duradoura.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Histórias de Sucesso</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como o PrimeFit tem transformado vidas através de nosso programa de emagrecimento personalizado.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  C
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Carla Silva</h4>
                  <p className="text-gray-500">Perdeu 15kg em 4 meses</p>
                </div>
              </div>
              <p className="text-gray-600">
                "O PrimeFit mudou completamente minha relação com exercícios e alimentação. O acompanhamento personalizado fez toda a diferença para manter a motivação e alcançar meus objetivos."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="card p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Rafael Oliveira</h4>
                  <p className="text-gray-500">Perdeu 22kg em 6 meses</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Depois de tentar várias dietas sem sucesso, encontrei no PrimeFit um método que realmente funciona. O dashboard me ajuda a manter o foco e ver meu progresso diariamente."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="card p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Mariana Costa</h4>
                  <p className="text-gray-500">Perdeu 18kg em 5 meses</p>
                </div>
              </div>
              <p className="text-gray-600">
                "O que mais gostei foi a abordagem personalizada. Meu plano foi adaptado às minhas necessidades e limitações, tornando o processo de emagrecimento muito mais natural e sustentável."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar seu corpo?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Comece hoje mesmo sua jornada de transformação com o PrimeFit. Nossos especialistas estão prontos para te ajudar a alcançar seus objetivos.
          </p>
          <Link to="/emagrecimento" className="btn bg-white text-accent-600 hover:bg-gray-100">
            Começar Agora
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
