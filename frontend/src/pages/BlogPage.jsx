import React from 'react'
import { Link } from 'react-router-dom'

const BlogPage = () => {
  // Dados simulados de posts do blog
  const blogPosts = [
    {
      id: 1,
      title: 'Como perder peso de forma saudável e sustentável',
      excerpt: 'Descubra estratégias comprovadas para perder peso de forma saudável, sem dietas restritivas e com resultados duradouros.',
      date: '15 de maio de 2025',
      author: 'Dra. Camila Santos',
      category: 'Emagrecimento',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352'
    },
    {
      id: 2,
      title: 'Os 5 erros mais comuns na busca pelo emagrecimento',
      excerpt: 'Muitas pessoas cometem erros que sabotam seus resultados. Conheça os principais e aprenda como evitá-los em sua jornada.',
      date: '28 de abril de 2025',
      author: 'Prof. Ricardo Oliveira',
      category: 'Emagrecimento',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'
    },
    {
      id: 3,
      title: 'Guia completo de nutrição para quem quer emagrecer',
      excerpt: 'Entenda os princípios fundamentais da nutrição para emagrecimento e como aplicá-los no seu dia a dia para resultados consistentes.',
      date: '10 de abril de 2025',
      author: 'Nutricionista Ana Paula Costa',
      category: 'Nutrição',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061'
    },
    {
      id: 4,
      title: 'Treino HIIT: como acelerar seu metabolismo e queimar mais gordura',
      excerpt: 'O treinamento intervalado de alta intensidade pode ser a chave para desbloquear seu potencial de emagrecimento. Saiba como implementá-lo.',
      date: '2 de abril de 2025',
      author: 'Prof. Marcos Silva',
      category: 'Treino',
      image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798'
    },
    {
      id: 5,
      title: 'A importância do sono na perda de peso',
      excerpt: 'Dormir bem é fundamental para emagrecer. Descubra como a qualidade do sono afeta seus hormônios e seu peso corporal.',
      date: '25 de março de 2025',
      author: 'Dra. Fernanda Lima',
      category: 'Saúde',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55'
    },
    {
      id: 6,
      title: 'Transformação corporal: histórias reais de clientes PrimeFit',
      excerpt: 'Conheça histórias inspiradoras de pessoas que transformaram seus corpos e suas vidas com o método PrimeFit.',
      date: '18 de março de 2025',
      author: 'Equipe PrimeFit',
      category: 'Casos de Sucesso',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
    },
  ]

  // Categorias para filtro
  const categories = [
    'Todas',
    'Emagrecimento',
    'Nutrição',
    'Treino',
    'Saúde',
    'Casos de Sucesso'
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Blog PrimeFit</h1>
      
      {/* Descrição do blog */}
      <div className="mb-12">
        <p className="text-lg text-gray-600">
          Dicas, estratégias e informações baseadas em ciência para te ajudar a alcançar seus objetivos
          de emagrecimento e transformação corporal.
        </p>
      </div>
      
      {/* Filtro de categorias */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                index === 0
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Posts em destaque */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Posts em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Post em destaque 1 */}
          <div className="card overflow-hidden">
            <img
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>{blogPosts[0].date}</span>
                <span className="mx-2">•</span>
                <span>{blogPosts[0].category}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{blogPosts[0].title}</h3>
              <p className="text-gray-600 mb-4">{blogPosts[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Por {blogPosts[0].author}</span>
                <Link to={`/blog/${blogPosts[0].id}`} className="text-primary-600 font-medium hover:text-primary-700">
                  Ler mais →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Post em destaque 2 */}
          <div className="card overflow-hidden">
            <img
              src={blogPosts[1].image}
              alt={blogPosts[1].title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>{blogPosts[1].date}</span>
                <span className="mx-2">•</span>
                <span>{blogPosts[1].category}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{blogPosts[1].title}</h3>
              <p className="text-gray-600 mb-4">{blogPosts[1].excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Por {blogPosts[1].author}</span>
                <Link to={`/blog/${blogPosts[1].id}`} className="text-primary-600 font-medium hover:text-primary-700">
                  Ler mais →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Todos os Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.slice(2).map(post => (
            <div key={post.id} className="card overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Por {post.author}</span>
                  <Link to={`/blog/${post.id}`} className="text-primary-600 font-medium hover:text-primary-700">
                    Ler mais →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Paginação */}
      <div className="mt-12 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
            Anterior
          </button>
          <button className="px-3 py-2 rounded-md bg-primary-600 text-white">
            1
          </button>
          <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
            Próxima
          </button>
        </nav>
      </div>
      
      {/* Newsletter */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Inscreva-se em nossa newsletter</h2>
          <p className="text-gray-600 mb-6">
            Receba dicas exclusivas de emagrecimento, treinos e nutrição diretamente no seu email.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="input flex-1"
            />
            <button className="btn btn-primary">
              Inscrever-se
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPage
