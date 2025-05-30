import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const BlogPostPage = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState([])
  
  // Dados simulados de posts do blog
  const blogPosts = [
    {
      id: "1",
      title: 'Como perder peso de forma saudável e sustentável',
      content: `
        <p>Perder peso de forma saudável e sustentável é um objetivo comum para muitas pessoas, mas frequentemente cercado de mitos e abordagens equivocadas. Neste artigo, vamos explorar estratégias baseadas em evidências científicas para ajudar você a alcançar seus objetivos de emagrecimento de maneira eficaz e duradoura.</p>
        
        <h2>Por que dietas restritivas não funcionam a longo prazo</h2>
        
        <p>Muitas pessoas recorrem a dietas altamente restritivas na esperança de perder peso rapidamente. No entanto, pesquisas mostram que 95% das dietas falham a longo prazo, com a maioria das pessoas recuperando todo o peso perdido (e frequentemente mais) dentro de 1-5 anos.</p>
        
        <p>Isso acontece porque:</p>
        
        <ul>
          <li>Dietas muito restritivas diminuem seu metabolismo</li>
          <li>Restrições severas aumentam os hormônios da fome</li>
          <li>Abordagens extremas são psicologicamente insustentáveis</li>
          <li>Ciclos de perda e ganho de peso (efeito sanfona) podem ser prejudiciais à saúde</li>
        </ul>
        
        <h2>Princípios fundamentais para emagrecimento saudável</h2>
        
        <h3>1. Déficit calórico moderado</h3>
        
        <p>O princípio básico para perda de peso é criar um déficit calórico - consumir menos calorias do que você gasta. No entanto, déficits muito grandes podem ser contraproducentes. Um déficit moderado de 300-500 calorias por dia é geralmente mais eficaz e sustentável, resultando em uma perda de peso de 0,5-1kg por semana.</p>
        
        <h3>2. Alimentação baseada em alimentos integrais</h3>
        
        <p>Em vez de contar obsessivamente calorias, foque em melhorar a qualidade da sua alimentação:</p>
        
        <ul>
          <li>Priorize vegetais, frutas, proteínas magras e grãos integrais</li>
          <li>Reduza alimentos ultraprocessados, açúcares adicionados e gorduras trans</li>
          <li>Mantenha-se hidratado, bebendo principalmente água</li>
          <li>Pratique a alimentação consciente, prestando atenção aos sinais de fome e saciedade</li>
        </ul>
        
        <h3>3. Atividade física regular</h3>
        
        <p>O exercício é fundamental não apenas para queimar calorias, mas também para preservar a massa muscular durante o emagrecimento e melhorar a saúde metabólica:</p>
        
        <ul>
          <li>Combine treinamento de força (2-3x por semana) para preservar e construir músculos</li>
          <li>Inclua atividades cardiovasculares (150+ minutos por semana) para melhorar a saúde cardiorrespiratória</li>
          <li>Aumente a atividade física no dia a dia (caminhar mais, usar escadas, etc.)</li>
          <li>Escolha atividades que você goste para manter a consistência</li>
        </ul>
        
        <h3>4. Sono e gerenciamento do estresse</h3>
        
        <p>Fatores frequentemente negligenciados, mas cruciais para o emagrecimento:</p>
        
        <ul>
          <li>Priorize 7-9 horas de sono de qualidade por noite</li>
          <li>Pratique técnicas de gerenciamento de estresse (meditação, respiração profunda, etc.)</li>
          <li>Estabeleça uma rotina regular de sono</li>
          <li>Limite a exposição a telas antes de dormir</li>
        </ul>
        
        <h2>Estratégias práticas para implementar hoje</h2>
        
        <h3>Planejamento de refeições</h3>
        
        <p>Preparar refeições com antecedência pode ajudar a evitar escolhas impulsivas e manter o controle sobre sua alimentação. Reserve algumas horas por semana para planejar e preparar refeições saudáveis.</p>
        
        <h3>Monitoramento consciente</h3>
        
        <p>Manter um registro do que você come, sua atividade física e seu progresso pode aumentar significativamente suas chances de sucesso. Isso não precisa ser obsessivo - mesmo um registro básico pode trazer consciência aos seus hábitos.</p>
        
        <h3>Sistema de apoio</h3>
        
        <p>Cerque-se de pessoas que apoiam seus objetivos. Considere trabalhar com um profissional qualificado, como um nutricionista ou personal trainer, para orientação personalizada.</p>
        
        <h3>Definição de metas realistas</h3>
        
        <p>Estabeleça metas específicas, mensuráveis, atingíveis, relevantes e com prazo definido (SMART). Celebre pequenas vitórias ao longo do caminho.</p>
        
        <h2>Conclusão</h2>
        
        <p>Perder peso de forma saudável e sustentável não é sobre dietas da moda ou soluções rápidas. É sobre criar um estilo de vida equilibrado que você possa manter a longo prazo. Lembre-se de que o progresso não é linear - haverá altos e baixos ao longo do caminho. O importante é manter a consistência e fazer ajustes conforme necessário.</p>
        
        <p>No PrimeFit, acreditamos em uma abordagem personalizada para o emagrecimento, considerando suas necessidades, preferências e estilo de vida únicos. Se você está buscando orientação especializada em sua jornada de transformação, nossa equipe está pronta para ajudar.</p>
      `,
      date: '15 de maio de 2025',
      author: 'Dra. Camila Santos',
      authorTitle: 'Nutricionista Esportiva',
      authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      category: 'Emagrecimento',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
      tags: ['emagrecimento', 'nutrição', 'saúde', 'dieta']
    },
    {
      id: "2",
      title: 'Os 5 erros mais comuns na busca pelo emagrecimento',
      content: `
        <p>Muitas pessoas embarcam na jornada de emagrecimento com grande motivação, mas acabam cometendo erros que podem sabotar seus resultados. Neste artigo, vamos explorar os cinco erros mais comuns e como evitá-los para alcançar sucesso duradouro.</p>
        
        <h2>Erro 1: Focar apenas em dietas restritivas</h2>
        
        <p>Um dos erros mais frequentes é acreditar que dietas altamente restritivas são a única solução para perder peso. Embora possam gerar resultados rápidos inicialmente, raramente são sustentáveis a longo prazo.</p>
        
        <p><strong>Por que é um problema:</strong> Restrições severas podem levar a:</p>
        <ul>
          <li>Desaceleração do metabolismo</li>
          <li>Deficiências nutricionais</li>
          <li>Compulsão alimentar</li>
          <li>Relacionamento negativo com a comida</li>
          <li>Efeito sanfona (perder e recuperar peso repetidamente)</li>
        </ul>
        
        <p><strong>Solução:</strong> Em vez de dietas extremas, adote mudanças graduais e sustentáveis em sua alimentação. Foque em adicionar alimentos nutritivos (vegetais, frutas, proteínas magras, grãos integrais) em vez de apenas eliminar alimentos. Permita-se flexibilidade e ocasionalmente desfrute de alimentos que você gosta em porções moderadas.</p>
        
        <h2>Erro 2: Negligenciar o treinamento de força</h2>
        
        <p>Muitas pessoas focam exclusivamente em exercícios cardiovasculares quando querem emagrecer, ignorando o treinamento de força.</p>
        
        <p><strong>Por que é um problema:</strong> O treinamento de força é crucial para:</p>
        <ul>
          <li>Preservar e construir massa muscular durante o déficit calórico</li>
          <li>Aumentar o metabolismo basal (músculos queimam mais calorias em repouso)</li>
          <li>Melhorar a composição corporal (proporção entre músculo e gordura)</li>
          <li>Prevenir o efeito platô no emagrecimento</li>
        </ul>
        
        <p><strong>Solução:</strong> Inclua 2-3 sessões semanais de treinamento de força em sua rotina. Não se preocupe em ficar "muito musculoso" - isso requer anos de treinamento específico e nutrição direcionada, especialmente para mulheres. Foque em exercícios compostos que trabalham múltiplos grupos musculares, como agachamentos, levantamento terra, supino e remada.</p>
        
        <h2>Erro 3: Subestimar a importância do sono e gerenciamento do estresse</h2>
        
        <p>Muitas pessoas focam apenas em dieta e exercício, ignorando outros fatores cruciais como sono e estresse.</p>
        
        <p><strong>Por que é um problema:</strong></p>
        <ul>
          <li>Privação de sono aumenta os hormônios da fome (grelina) e diminui os hormônios da saciedade (leptina)</li>
          <li>Estresse crônico eleva o cortisol, que pode promover o armazenamento de gordura abdominal</li>
          <li>Cansaço e estresse frequentemente levam a escolhas alimentares impulsivas e pular treinos</li>
        </ul>
        
        <p><strong>Solução:</strong> Priorize 7-9 horas de sono de qualidade por noite. Estabeleça uma rotina de sono consistente e crie um ambiente propício para descanso. Implemente técnicas de gerenciamento de estresse como meditação, respiração profunda, yoga ou outras atividades que você goste e ajudem a relaxar.</p>
        
        <h2>Erro 4: Buscar resultados muito rápidos</h2>
        
        <p>A impaciência pode ser um grande obstáculo no processo de emagrecimento, levando a estratégias extremas e insustentáveis.</p>
        
        <p><strong>Por que é um problema:</strong></p>
        <ul>
          <li>Perda de peso muito rápida geralmente vem da perda de água e massa muscular, não apenas gordura</li>
          <li>Abordagens extremas são difíceis de manter e frequentemente levam ao abandono</li>
          <li>Ciclos de "tudo ou nada" prejudicam a relação com alimentação e exercício</li>
        </ul>
        
        <p><strong>Solução:</strong> Estabeleça expectativas realistas. Uma perda de peso saudável e sustentável é de aproximadamente 0,5-1kg por semana. Foque em criar hábitos que você possa manter por toda a vida, não apenas por algumas semanas. Celebre pequenas vitórias ao longo do caminho, como mais energia, melhor sono ou roupas mais confortáveis, não apenas o número na balança.</p>
        
        <h2>Erro 5: Não personalizar a abordagem</h2>
        
        <p>Seguir planos genéricos ou copiar a dieta e treino de outras pessoas raramente leva a resultados ótimos.</p>
        
        <p><strong>Por que é um problema:</strong></p>
        <ul>
          <li>Cada pessoa tem necessidades nutricionais únicas baseadas em idade, sexo, nível de atividade, histórico médico, etc.</li>
          <li>Preferências alimentares, estilo de vida e horários variam de pessoa para pessoa</li>
          <li>O que funciona para um influenciador fitness pode não funcionar para você</li>
        </ul>
        
        <p><strong>Solução:</strong> Busque uma abordagem personalizada que considere suas necessidades específicas, preferências e estilo de vida. Trabalhar com profissionais qualificados como nutricionistas e personal trainers pode ajudar a criar um plano sob medida para você. Esteja disposto a fazer ajustes conforme necessário, baseado em como seu corpo responde.</p>
        
        <h2>Conclusão</h2>
        
        <p>Evitar esses erros comuns pode fazer uma grande diferença em sua jornada de emagrecimento. Lembre-se de que transformações duradouras vêm de mudanças sustentáveis no estilo de vida, não de soluções rápidas. Seja paciente consigo mesmo e foque no progresso, não na perfeição.</p>
        
        <p>No PrimeFit, nossa abordagem é baseada em ciência e personalizada para cada indivíduo. Entendemos que cada jornada é única e estamos comprometidos em fornecer o suporte necessário para ajudá-lo a alcançar seus objetivos de forma saudável e sustentável.</p>
      `,
      date: '28 de abril de 2025',
      author: 'Prof. Ricardo Oliveira',
      authorTitle: 'Educador Físico e Especialista em Emagrecimento',
      authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      category: 'Emagrecimento',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      tags: ['emagrecimento', 'erros comuns', 'dicas', 'saúde']
    },
    {
      id: "3",
      title: 'Guia completo de nutrição para quem quer emagrecer',
      content: `Conteúdo detalhado sobre nutrição para emagrecimento...`,
      date: '10 de abril de 2025',
      author: 'Nutricionista Ana Paula Costa',
      authorTitle: 'Nutricionista Clínica',
      authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      category: 'Nutrição',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
      tags: ['nutrição', 'emagrecimento', 'alimentação', 'dieta']
    },
    {
      id: "4",
      title: 'Treino HIIT: como acelerar seu metabolismo e queimar mais gordura',
      content: `Conteúdo detalhado sobre treino HIIT...`,
      date: '2 de abril de 2025',
      author: 'Prof. Marcos Silva',
      authorTitle: 'Especialista em HIIT e Condicionamento Físico',
      authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      category: 'Treino',
      image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798',
      tags: ['treino', 'HIIT', 'metabolismo', 'queima de gordura']
    },
    {
      id: "5",
      title: 'A importância do sono na perda de peso',
      content: `Conteúdo detalhado sobre sono e emagrecimento...`,
      date: '25 de março de 2025',
      author: 'Dra. Fernanda Lima',
      authorTitle: 'Médica Especialista em Medicina do Sono',
      authorImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb',
      category: 'Saúde',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55',
      tags: ['sono', 'saúde', 'emagrecimento', 'hormônios']
    },
    {
      id: "6",
      title: 'Transformação corporal: histórias reais de clientes PrimeFit',
      content: `Conteúdo detalhado sobre histórias de sucesso...`,
      date: '18 de março de 2025',
      author: 'Equipe PrimeFit',
      authorTitle: 'Time de Especialistas',
      authorImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
      category: 'Casos de Sucesso',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      tags: ['transformação', 'antes e depois', 'motivação', 'resultados']
    },
  ]
  
  useEffect(() => {
    // Simula busca do post pelo ID
    const fetchPost = () => {
      setLoading(true)
      
      // Encontra o post pelo ID
      const foundPost = blogPosts.find(post => post.id === id)
      
      if (foundPost) {
        setPost(foundPost)
        
        // Encontra posts relacionados (mesma categoria)
        const related = blogPosts
          .filter(p => p.id !== id && p.category === foundPost.category)
          .slice(0, 3)
        
        setRelatedPosts(related)
      }
      
      setLoading(false)
    }
    
    fetchPost()
  }, [id])
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <p className="text-gray-600 mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Link to="/blog" className="btn btn-primary">
            Voltar para o Blog
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-gray-700">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>
        </div>
        
        {/* Post header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center mb-6">
            <img
              src={post.authorImage}
              alt={post.author}
              className="w-10 h-10 rounded-full object-cover mr-4"
            />
            <div>
              <p className="font-medium">{post.author}</p>
              <div className="flex text-sm text-gray-500">
                <p>{post.authorTitle}</p>
                <span className="mx-2">•</span>
                <p>{post.date}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Featured image */}
        <div className="mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-80 object-cover rounded-xl"
          />
        </div>
        
        {/* Post content */}
        <div className="prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        {/* Author bio */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12">
          <div className="flex items-center">
            <img
              src={post.authorImage}
              alt={post.author}
              className="w-16 h-16 rounded-full object-cover mr-6"
            />
            <div>
              <h3 className="text-lg font-bold">{post.author}</h3>
              <p className="text-gray-600 mb-2">{post.authorTitle}</p>
              <p className="text-gray-600">
                Especialista em nutrição e emagrecimento com mais de 10 anos de experiência ajudando pessoas a transformarem seus corpos e suas vidas.
              </p>
            </div>
          </div>
        </div>
        
        {/* Share buttons */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 mb-12">
          <div className="text-gray-600">Compartilhe este artigo:</div>
          <div className="flex space-x-4">
            <button className="text-gray-500 hover:text-blue-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-blue-400">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-green-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-blue-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Posts Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <div key={relatedPost.id} className="card overflow-hidden">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{relatedPost.title}</h3>
                    <Link to={`/blog/${relatedPost.id}`} className="text-primary-600 font-medium hover:text-primary-700">
                      Ler mais →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPostPage
