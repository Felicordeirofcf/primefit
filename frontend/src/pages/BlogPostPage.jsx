import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import Supabase client
import { FiUser, FiCalendar, FiTag, FiArrowLeft, FiLoader, FiAlertCircle } from 'react-icons/fi'; // Using react-icons

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      if (!id) {
        setError('ID do post inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPost(null);
      setRelatedPosts([]);

      try {
        // Fetch the main post by ID
        console.log(`Buscando post com ID: ${id}`);
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*') // Select all columns
          .eq('id', id)
          .single(); // Expecting a single result

        if (postError) {
          if (postError.code === 'PGRST116') { // Post not found code
            console.warn(`Post com ID ${id} não encontrado.`);
            setError('Post não encontrado.');
          } else {
            console.error('Erro ao buscar post:', postError);
            throw new Error('Falha ao carregar o post.');
          }
          setLoading(false);
          return;
        }

        if (postData) {
          console.log('Post encontrado:', postData);
          setPost(postData);

          // Fetch related posts (same category, different ID)
          if (postData.category) {
            console.log(`Buscando posts relacionados na categoria: ${postData.category}`);
            const { data: relatedData, error: relatedError } = await supabase
              .from('posts')
              .select('id, title, image_url, category') // Select only needed fields
              .eq('category', postData.category)
              .neq('id', id) // Exclude the current post
              .limit(3); // Limit to 3 related posts

            if (relatedError) {
              console.warn('Erro ao buscar posts relacionados:', relatedError);
              // Don't block rendering if related posts fail
            } else {
              console.log('Posts relacionados encontrados:', relatedData);
              setRelatedPosts(relatedData || []);
            }
          }
        } else {
           setError('Post não encontrado.'); // Should be caught by PGRST116, but as a fallback
        }

      } catch (err) {
        console.error('Erro ao buscar dados do post:', err);
        setError(err.message || 'Ocorreu um erro ao carregar o post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndRelated();
  }, [id]); // Re-fetch if the ID changes

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex justify-center items-center">
        <FiLoader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex flex-col justify-center items-center text-center">
        <FiAlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Erro ao Carregar</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/blog')}
          className="btn btn-primary flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Voltar para o Blog
        </button>
      </div>
    );
  }

  // Post Not Found (handled by error state now, but kept for clarity)
  if (!post) {
    return (
       <div className="container mx-auto px-4 py-12 min-h-[60vh] flex flex-col justify-center items-center text-center">
         <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
         <p className="text-gray-600 mb-6">O artigo que você está procurando não existe ou foi removido.</p>
         <button
           onClick={() => navigate('/blog')}
           className="btn btn-primary flex items-center"
         >
           <FiArrowLeft className="mr-2" /> Voltar para o Blog
         </button>
       </div>
     );
  }

  // Render Post Content
  return (
    <div className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Post Header Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          )}

          <article className="p-6 md:p-10 lg:p-12">
            {/* Back to Blog Link */}
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6 group"
            >
              <FiArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar para o Blog
            </Link>

            {/* Category */}
            {post.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                {post.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info (Author, Date) */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8 space-x-4">
              {post.author && (
                <div className="flex items-center">
                  <FiUser className="mr-1.5 h-4 w-4" />
                  <span>Por {post.author}</span>
                </div>
              )}
              {post.created_at && (
                <div className="flex items-center">
                  <FiCalendar className="mr-1.5 h-4 w-4" />
                  <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                </div>
              )}
            </div>

            {/* Post Content (Rendered from HTML string) */}
            {/* WARNING: Ensure the HTML content from Supabase is sanitized to prevent XSS attacks */}
            {/* Consider using a library like DOMPurify if content comes from untrusted sources */}
            <div
              className="prose prose-lg max-w-none prose-blue prose-img:rounded-lg prose-a:text-blue-600 hover:prose-a:text-blue-800"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Tags */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <FiTag className="mr-1.5 h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 md:mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} to={`/blog/${related.id}`} className="block bg-white rounded-lg shadow overflow-hidden group transition-shadow hover:shadow-md">
                  {related.image_url && (
                    <img src={related.image_url} alt={related.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    {related.category && <span className="text-xs text-blue-600 font-semibold mb-1 block">{related.category}</span>}
                    <h4 className="text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700">{related.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;

