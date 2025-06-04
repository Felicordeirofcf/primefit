import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import Supabase client
import { FiFilter, FiSearch, FiMail, FiArrowLeft, FiArrowRight } from 'react-icons/fi'; // Using react-icons

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 6; // Number of posts per page

  // TODO: Fetch categories dynamically from Supabase if needed
  const categories = [
    'Todas',
    'Emagrecimento',
    'Nutrição',
    'Treino',
    'Saúde',
    'Casos de Sucesso'
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate pagination range
        const rangeStart = (currentPage - 1) * postsPerPage;
        const rangeEnd = rangeStart + postsPerPage - 1;

        let query = supabase
          .from('posts') // Assuming a 'posts' table in Supabase
          .select('*', { count: 'exact' }) // Select all columns and get total count
          .order('created_at', { ascending: false })
          .range(rangeStart, rangeEnd);

        // Apply category filter if not 'Todas'
        if (selectedCategory !== 'Todas') {
          query = query.eq('category', selectedCategory); // Assuming a 'category' column
        }

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setPosts(data);
          setTotalPages(Math.ceil(count / postsPerPage));
        } else {
          setPosts([]);
          setTotalPages(1);
        }

      } catch (err) {
        console.error('Erro ao buscar posts:', err);
        setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, currentPage]); // Refetch when category or page changes

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // TODO: Implement newsletter subscription logic (e.g., call Supabase function)
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    console.log('Newsletter subscription attempt:', email);
    alert('Funcionalidade de inscrição na newsletter ainda não implementada.');
    // Example: await supabase.functions.invoke('subscribe-newsletter', { email });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateString; // Return original if formatting fails
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Blog PrimeFit</h1>
      <p className="text-lg text-gray-600 mb-10">
        Dicas, estratégias e informações baseadas em ciência para te ajudar a alcançar seus objetivos.
      </p>

      {/* Filter and Search Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Category Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <FiFilter className="text-gray-500 mr-1" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filtrar por:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ease-in-out ${selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Search (Optional - requires implementation) */}
        {/* <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Buscar no blog..." className="input pl-10 w-full text-sm" />
        </div> */}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 text-gray-600 rounded-lg">
          <p>Nenhum post encontrado {selectedCategory !== 'Todas' ? `na categoria "${selectedCategory}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
              {post.image_url && ( // Assuming an 'image_url' column
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                  {post.category && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{post.category}</span>}
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title={post.title}>{post.title}</h3>
                {post.excerpt && <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Por {post.author || 'Equipe PrimeFit'}</span>
                  <Link to={`/blog/${post.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    Ler mais <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && !error && posts.length > 0 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FiArrowLeft className="h-4 w-4 mr-1" /> Anterior
            </button>
            {[...Array(totalPages).keys()].map(num => (
              <button
                key={num + 1}
                onClick={() => handlePageChange(num + 1)}
                className={`px-4 py-2 rounded-md border text-sm font-medium ${currentPage === num + 1
                    ? 'bg-blue-600 text-white border-blue-600 z-10'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Próxima <FiArrowRight className="h-4 w-4 ml-1" />
            </button>
          </nav>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 md:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <FiMail className="mx-auto h-10 w-10 text-blue-600 mb-3" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Inscreva-se na Newsletter</h2>
          <p className="text-gray-600 mb-6">
            Receba dicas exclusivas de emagrecimento, treinos e nutrição diretamente no seu email.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="Seu melhor email"
              required
              className="input flex-1 text-sm shadow-sm"
              aria-label="Email para newsletter"
            />
            <button
              type="submit"
              className="btn btn-primary shadow-sm text-sm"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

