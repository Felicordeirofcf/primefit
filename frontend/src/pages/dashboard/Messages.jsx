import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { formatDate } from '../../utils/formatDate'; // Importar a função utilitária

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [otherUsers, setOtherUsers] = useState({});

  const fetchUserProfile = useCallback(async (userId) => {
    if (otherUsers[userId]) {
      return otherUsers[userId];
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return { id: userId, username: `User ${userId.substring(0, 6)}`, avatar_url: null, role: 'Unknown' };
      }
      if (data) {
        setOtherUsers(prev => ({ ...prev, [userId]: data }));
        return data;
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return { id: userId, username: `User ${userId.substring(0, 6)}`, avatar_url: null, role: 'Unknown' };
    }
    return { id: userId, username: `User ${userId.substring(0, 6)}`, avatar_url: null, role: 'Unknown' };
  }, [otherUsers]);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('mensagens')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (messageError) {
        throw messageError;
      }

      const groupedConversations = {};
      const userPromises = [];

      for (const msg of messageData) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!groupedConversations[otherUserId]) {
          groupedConversations[otherUserId] = {
            otherUserId: otherUserId,
            messages: [],
            lastMessage: null,
            unread: 0,
            with: null
          };
          if (!otherUsers[otherUserId]) {
             userPromises.push(fetchUserProfile(otherUserId));
          }
        }
        groupedConversations[otherUserId].messages.push(msg);
        if (!groupedConversations[otherUserId].lastMessage || new Date(msg.created_at) > new Date(groupedConversations[otherUserId].lastMessage.created_at)) {
            groupedConversations[otherUserId].lastMessage = msg;
        }
        if (msg.receiver_id === user.id && !msg.is_read) {
            groupedConversations[otherUserId].unread++;
        }
      }

      const profiles = await Promise.all(userPromises);
      const profilesMap = profiles.reduce((acc, profile) => {
          if (profile) acc[profile.id] = profile;
          return acc;
      }, {});

       setOtherUsers(prev => ({ ...prev, ...profilesMap }));

      Object.values(groupedConversations).forEach(convo => {
          convo.with = otherUsers[convo.otherUserId] || profilesMap[convo.otherUserId] || { id: convo.otherUserId, username: `User ${convo.otherUserId.substring(0, 6)}`, avatar_url: null, role: 'Unknown' };
      });

      const sortedConversations = Object.values(groupedConversations).sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
      });

      setConversations(sortedConversations);

      if (activeConversationId) {
        const activeConvoData = groupedConversations[activeConversationId];
        setMessages(activeConvoData ? activeConvoData.messages : []);
      } else if (sortedConversations.length > 0) {
        // Optionally select the first conversation by default
        // setActiveConversationId(sortedConversations[0].otherUserId);
        // setMessages(sortedConversations[0].messages);
        // markAsRead(sortedConversations[0].otherUserId);
      }

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Falha ao carregar mensagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user, activeConversationId, fetchUserProfile, otherUsers]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:mensagens')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens' },
        (payload) => {
          const newMessage = payload.new;
          if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
            console.log('New message received:', newMessage);
            setConversations(prevConversations => {
              const otherUserId = newMessage.sender_id === user.id ? newMessage.receiver_id : newMessage.sender_id;
              let convoExists = false;
              const updatedConversations = prevConversations.map(convo => {
                if (convo.otherUserId === otherUserId) {
                  convoExists = true;
                  return {
                    ...convo,
                    messages: [...convo.messages, newMessage],
                    lastMessage: newMessage,
                    unread: newMessage.receiver_id === user.id ? convo.unread + 1 : convo.unread
                  };
                }
                return convo;
              });

              if (!convoExists) {
                fetchUserProfile(otherUserId).then(profile => {
                    const newConvo = {
                        otherUserId: otherUserId,
                        messages: [newMessage],
                        lastMessage: newMessage,
                        unread: newMessage.receiver_id === user.id ? 1 : 0,
                        with: profile || { id: otherUserId, username: `User ${otherUserId.substring(0, 6)}`, avatar_url: null, role: 'Unknown' }
                    };
                    setConversations(prev => [newConvo, ...prev].sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)));
                });
                return updatedConversations;
              } else {
                 return updatedConversations.sort((a, b) => {
                    if (!a.lastMessage) return 1;
                    if (!b.lastMessage) return -1;
                    return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
                });
              }
            });

            if (activeConversationId === (newMessage.sender_id === user.id ? newMessage.receiver_id : newMessage.sender_id)) {
              setMessages(prevMessages => [...prevMessages, newMessage]);
              markAsRead(activeConversationId);
            }
          }
        }
      )
      .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
              console.log('Subscribed to messages channel!');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('Subscription error:', err);
              setError('Erro na conexão em tempo real. As mensagens podem não atualizar automaticamente.');
          }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversationId, fetchUserProfile]);

  // Função para enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !user) return;

    setSending(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('mensagens')
        .insert({
          sender_id: user.id,
          receiver_id: activeConversationId,
          content: newMessage.trim(),
          is_read: false
        });

      if (insertError) {
        throw insertError;
      }

      setNewMessage('');

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Falha ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  // Função para marcar mensagens como lidas
  const markAsRead = useCallback(async (otherUserId) => {
    if (!user || !otherUserId) return;

    setConversations(prev => prev.map(convo =>
        convo.otherUserId === otherUserId ? { ...convo, unread: 0 } : convo
    ));
    if (activeConversationId === otherUserId) {
        setMessages(prev => prev.map(msg =>
            msg.receiver_id === user.id && !msg.is_read ? { ...msg, is_read: true } : msg
        ));
    }

    try {
      const { error: updateError } = await supabase
        .from('mensagens')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

      if (updateError) {
        console.error('Error marking messages as read:', updateError);
      }
    } catch (err) {
        console.error('Unexpected error marking messages as read:', err);
    }
  }, [user, activeConversationId]);

  // Função para selecionar uma conversa
  const handleSelectConversation = (otherUserId) => {
    const selectedConvo = conversations.find(c => c.otherUserId === otherUserId);
    if (selectedConvo) {
        setActiveConversationId(otherUserId);
        setMessages(selectedConvo.messages);
        if (selectedConvo.unread > 0) {
            markAsRead(otherUserId);
        }
    } else {
        console.warn(`Conversation with ${otherUserId} not found.`);
        setActiveConversationId(otherUserId);
        setMessages([]);
    }
  };

  const activeConversationDetails = conversations.find(c => c.otherUserId === activeConversationId)?.with;

  if (loading && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mensagens</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversas */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="input w-full"
              disabled // Search not implemented yet
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !loading && (
                <p className="text-center text-gray-500 p-4">Nenhuma conversa encontrada.</p>
            )}
            {conversations.map(conversation => (
              <button
                key={conversation.otherUserId}
                onClick={() => handleSelectConversation(conversation.otherUserId)}
                className={`w-full text-left p-3 transition border-b border-gray-100 ${
                  activeConversationId === conversation.otherUserId
                    ? 'bg-primary-100 text-primary-800'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                    {conversation.with?.avatar_url ? (
                      <img src={conversation.with.avatar_url} alt={conversation.with?.username} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate text-sm">{conversation.with?.username || 'Usuário Desconhecido'}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {conversation.lastMessage ? formatDate(conversation.lastMessage.created_at).split(' ')[0] : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage?.content || 'Nenhuma mensagem'}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full flex-shrink-0 ml-2">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversa ativa */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          {activeConversationId ? (
            <>
              {/* Cabeçalho da conversa */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                  {activeConversationDetails?.avatar_url ? (
                    <img src={activeConversationDetails.avatar_url} alt={activeConversationDetails.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{activeConversationDetails?.username || 'Usuário Desconhecido'}</h3>
                  <p className="text-xs text-gray-500">{activeConversationDetails?.role || 'Cliente'}</p>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                        message.sender_id === user.id
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex justify-end items-center ${
                          message.sender_id === user.id ? 'text-primary-100 opacity-75' : 'text-gray-400'
                        }`}
                      >
                        {formatDate(message.created_at)}
                        {message.sender_id === user.id && (
                          <span className="ml-1.5">
                            {message.is_read ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" transform="translate(-4, 0)"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="input flex-1 mr-3"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11.69l4.768 1.06a1 1 0 001.169-1.409l-7-14z" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Selecione uma conversa para começar a conversar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

