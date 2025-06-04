import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { formatDate } from '../../utils/formatDate'; // Importar a função utilitária
import './PainelAdmin.css'; // Estilos podem precisar de ajustes

const AdminChat = () => {
  const { user: adminUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [clientProfiles, setClientProfiles] = useState({});

  const fetchClientProfile = useCallback(async (userId) => {
    if (clientProfiles[userId]) {
      return clientProfiles[userId];
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(`Error fetching profile for ${userId}:`, error);
        return { id: userId, username: `Cliente ${userId.substring(0, 6)}`, avatar_url: null, role: 'Cliente' };
      }
      if (data) {
        setClientProfiles(prev => ({ ...prev, [userId]: data }));
        return data;
      }
    } catch (err) {
      console.error(`Unexpected error fetching profile for ${userId}:`, err);
    }
    return { id: userId, username: `Cliente ${userId.substring(0, 6)}`, avatar_url: null, role: 'Cliente' };
  }, [clientProfiles]);

  const fetchInitialData = useCallback(async () => {
    if (!adminUser) return;
    setLoading(true);
    setError(null);

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('mensagens')
        .select('*')
        .or(`sender_id.eq.${adminUser.id},receiver_id.eq.${adminUser.id}`)
        .order('created_at', { ascending: true });

      if (messageError) throw messageError;

      const groupedConversations = {};
      const profilePromises = [];

      for (const msg of messageData) {
        const clientId = msg.sender_id === adminUser.id ? msg.receiver_id : msg.sender_id;

        if (!groupedConversations[clientId]) {
          groupedConversations[clientId] = {
            clientId: clientId,
            messages: [],
            lastMessage: null,
            unread: 0,
            with: null
          };
          if (!clientProfiles[clientId]) {
            profilePromises.push(fetchClientProfile(clientId));
          }
        }

        groupedConversations[clientId].messages.push(msg);

        if (!groupedConversations[clientId].lastMessage || new Date(msg.created_at) > new Date(groupedConversations[clientId].lastMessage.created_at)) {
          groupedConversations[clientId].lastMessage = msg;
        }
        if (msg.receiver_id === adminUser.id && !msg.is_read) {
          groupedConversations[clientId].unread++;
        }
      }

      const profiles = await Promise.all(profilePromises);
      const profilesMap = profiles.reduce((acc, profile) => {
        if (profile) acc[profile.id] = profile;
        return acc;
      }, {});

      setClientProfiles(prev => ({ ...prev, ...profilesMap }));

      Object.values(groupedConversations).forEach(convo => {
        convo.with = clientProfiles[convo.clientId] || profilesMap[convo.clientId] || { id: convo.clientId, username: `Cliente ${convo.clientId.substring(0, 6)}`, avatar_url: null, role: 'Cliente' };
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
        // setActiveConversationId(sortedConversations[0].clientId);
        // setMessages(sortedConversations[0].messages);
        // markAsRead(sortedConversations[0].clientId);
      }

    } catch (err) {
      console.error('Error fetching admin messages:', err);
      setError('Falha ao carregar mensagens dos clientes.');
    } finally {
      setLoading(false);
    }
  }, [adminUser, activeConversationId, fetchClientProfile, clientProfiles]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!adminUser) return;

    const channel = supabase
      .channel('public:mensagens:admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens' },
        (payload) => {
          const newMessage = payload.new;
          if (newMessage.sender_id === adminUser.id || newMessage.receiver_id === adminUser.id) {
            console.log('Admin received new message:', newMessage);
            const clientId = newMessage.sender_id === adminUser.id ? newMessage.receiver_id : newMessage.sender_id;

            setConversations(prevConversations => {
              let convoExists = false;
              const updatedConversations = prevConversations.map(convo => {
                if (convo.clientId === clientId) {
                  convoExists = true;
                  return {
                    ...convo,
                    messages: [...convo.messages, newMessage],
                    lastMessage: newMessage,
                    unread: newMessage.receiver_id === adminUser.id ? convo.unread + 1 : convo.unread
                  };
                }
                return convo;
              });

              if (!convoExists) {
                fetchClientProfile(clientId).then(profile => {
                  const newConvo = {
                    clientId: clientId,
                    messages: [newMessage],
                    lastMessage: newMessage,
                    unread: newMessage.receiver_id === adminUser.id ? 1 : 0,
                    with: profile || { id: clientId, username: `Cliente ${clientId.substring(0, 6)}`, avatar_url: null, role: 'Cliente' }
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

            if (activeConversationId === clientId) {
              setMessages(prevMessages => [...prevMessages, newMessage]);
              markAsRead(clientId);
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin subscribed to messages channel!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Admin subscription error:', err);
          setError('Erro na conexão em tempo real (Admin).');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminUser, activeConversationId, fetchClientProfile]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !adminUser) return;

    setSending(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('mensagens')
        .insert({
          sender_id: adminUser.id,
          receiver_id: activeConversationId,
          content: newMessage.trim(),
          is_read: false
        });

      if (insertError) throw insertError;

      setNewMessage('');

    } catch (err) {
      console.error('Error sending admin message:', err);
      setError('Falha ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = useCallback(async (clientId) => {
    if (!adminUser || !clientId) return;

    setConversations(prev => prev.map(convo =>
        convo.clientId === clientId ? { ...convo, unread: 0 } : convo
    ));
     if (activeConversationId === clientId) {
        setMessages(prev => prev.map(msg =>
            msg.receiver_id === adminUser.id && !msg.is_read ? { ...msg, is_read: true } : msg
        ));
    }

    try {
      const { error: updateError } = await supabase
        .from('mensagens')
        .update({ is_read: true })
        .eq('receiver_id', adminUser.id)
        .eq('sender_id', clientId)
        .eq('is_read', false);

      if (updateError) {
        console.error('Error marking admin messages as read:', updateError);
      }
    } catch (err) {
        console.error('Unexpected error marking admin messages as read:', err);
    }
  }, [adminUser, activeConversationId]);

  const handleSelectConversation = (clientId) => {
     const selectedConvo = conversations.find(c => c.clientId === clientId);
     if (selectedConvo) {
        setActiveConversationId(clientId);
        setMessages(selectedConvo.messages);
        if (selectedConvo.unread > 0) {
            markAsRead(clientId);
        }
     } else {
         console.warn(`Admin: Conversation with ${clientId} not found.`);
         setActiveConversationId(clientId);
         setMessages([]);
     }
  };

  const activeConversationDetails = conversations.find(c => c.clientId === activeConversationId)?.with;

  if (!adminUser) {
      return <p className="text-center text-red-500 p-4">Erro: Administrador não autenticado.</p>;
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-4">Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div className="admin-chat-container mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">💬 Chat com Clientes</h3>
      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-350px)]">
        {/* Lista de conversas (Clientes) */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col border">
          <div className="p-3 border-b bg-gray-50">
             <h4 className="font-medium text-sm">Clientes</h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !loading && (
                <p className="text-center text-gray-500 p-4 text-sm">Nenhuma conversa iniciada.</p>
            )}
            {conversations.map(conversation => (
              <button
                key={conversation.clientId}
                onClick={() => handleSelectConversation(conversation.clientId)}
                className={`w-full text-left p-3 transition border-b border-gray-100 ${
                  activeConversationId === conversation.clientId
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-2.5 flex-shrink-0">
                    {conversation.with?.avatar_url ? (
                      <img src={conversation.with.avatar_url} alt={conversation.with?.username} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate text-sm">{conversation.with?.username || 'Cliente Desconhecido'}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {conversation.lastMessage ? formatDate(conversation.lastMessage.created_at).split(' ')[0] : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage?.sender_id === adminUser.id ? 'Você: ' : ''}
                        {conversation.lastMessage?.content || 'Nenhuma mensagem'}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex-shrink-0 ml-2">
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

        {/* Conversa ativa com Cliente */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden flex flex-col border">
          {activeConversationId ? (
            <>
              {/* Cabeçalho da conversa */}
              <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-2.5 flex-shrink-0">
                  {activeConversationDetails?.avatar_url ? (
                    <img src={activeConversationDetails.avatar_url} alt={activeConversationDetails.username} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{activeConversationDetails?.username || 'Cliente Desconhecido'}</h3>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100/50">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === adminUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg py-2 px-3 shadow-sm text-sm ${
                        message.sender_id === adminUser.id
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex justify-end items-center ${
                          message.sender_id === adminUser.id ? 'text-blue-100 opacity-75' : 'text-gray-400'
                        }`}
                      >
                        {formatDate(message.created_at)} {/* Usar a função importada */}
                        {message.sender_id === adminUser.id && (
                          <span className="ml-1.5">
                            {message.is_read ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" transform="translate(-4, 0)"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
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
              <div className="p-3 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    placeholder={`Mensagem para ${activeConversationDetails?.username || 'Cliente'}...`}
                    className="input flex-1 mr-2 text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11.69l4.768 1.06a1 1 0 001.169-1.409l-7-14z" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
              Selecione uma conversa com um cliente para visualizar as mensagens.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

