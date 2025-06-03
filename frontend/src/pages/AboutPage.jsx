import React from 'react'

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Sobre o PrimeFit</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          O PrimeFit é uma plataforma especializada em consultoria de emagrecimento e transformação corporal, 
          oferecendo acompanhamento personalizado para resultados reais e duradouros.
        </p>
        <p className="mb-6">
          Nossa missão é ajudar pessoas a alcançarem seus objetivos de saúde e forma física através de 
          métodos cientificamente comprovados, suporte contínuo e tecnologia de ponta.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Nossa História</h2>
        <p className="mb-4">
          Fundado em 2023, o PrimeFit nasceu da paixão por transformar vidas através da atividade física e 
          alimentação saudável. Nossos fundadores, profissionais de educação física e nutrição, perceberam 
          que muitas pessoas abandonavam seus objetivos por falta de acompanhamento adequado.
        </p>
        <p className="mb-6">
          A partir dessa percepção, desenvolvemos uma plataforma que combina tecnologia e conhecimento 
          especializado para oferecer um acompanhamento verdadeiramente personalizado.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Nossa Metodologia</h2>
        <p className="mb-4">
          No PrimeFit, acreditamos que cada pessoa é única e, por isso, desenvolvemos uma metodologia 
          que se adapta às necessidades individuais de cada cliente.
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Avaliação física e nutricional detalhada</li>
          <li className="mb-2">Planos de treino personalizados</li>
          <li className="mb-2">Acompanhamento contínuo com feedback em tempo real</li>
          <li className="mb-2">Ajustes periódicos baseados em resultados</li>
          <li className="mb-2">Suporte motivacional e educativo</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Nossa Equipe</h2>
        <p className="mb-4">
          Contamos com uma equipe multidisciplinar de profissionais especializados em emagrecimento e 
          transformação corporal, incluindo educadores físicos, nutricionistas e psicólogos.
        </p>
        <p>
          Todos os nossos profissionais são certificados e passam por treinamentos constantes para 
          se manterem atualizados com as mais recentes descobertas científicas na área de saúde e fitness.
        </p>
      </div>
    </div>
  )
}

export default AboutPage
