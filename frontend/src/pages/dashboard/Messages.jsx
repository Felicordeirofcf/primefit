import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { messagesAPI, profilesAPI } from '../../api/apiClient';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, User } from 'lucide-react';

// Dados mock para quando a API não estiver disponível
const mockUsers = [
  { id: 'admin', nome: 'Administrador', email: 'admin@primefit.com', role: 'admin', avatar_url: null },
  { id: 'trainer1', nome: 'João Treinador', email: 'joao@primefit.com', role: 'trainer', avatar_url: null },
  { id: 'support', nome: 'Suporte', email: 'suporte@primefit.com', role: 'support', avatar_url: null },
];

const mockMessages = [
  { 
    id: '1', 
    sender_id: 'admin', 
    receiver_id: 'current_user', 
    content: 'Olá! Como posso ajudar você hoje?', 
    created_at: '2025-06-05T10:00:00Z',
    is_read: true
  },
  { 
    id: '2', 
    sender_id: 'current_user', 
    receiver_id: 'admin', 
    content: 'Olá! Gostaria de saber mais sobre os planos de treino.', 
    created_at: '2025-06-05T10:05:00Z',
    is_read: true
  },
  { 
    id: '3', 
    sender_id: 'admin', 
    receiver_id: 'current_user', 
    content: 'Claro! Temos planos personalizados para diferentes objetivos. Qual é o seu objetivo principal?', 
    created_at: '2025-06-05T10:10:00Z',
    is_read: true
  },
];

const Messages = () => {
  const { user, userProfile, isAuthenticated, loading } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Inicializar WebSocket e carregar contatos
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadContacts = async () => {
      try {
        // Tentar carregar administradores e treinadores
        const { data, error } = await profilesAPI.getAllProfiles();
        
        if (error || !data) {
          console.error('Erro ao carregar contatos:', error);
          // Usar dados mock
          const mockContactsWithCurrentUser = mockUsers.map(contact => ({
            ...contact,
            id: contact.id === 'current_user' ? user.id : contact.id
          }));
          setContacts(mockContactsWithCurrentUser);
          // Selecionar o primeiro contato por padrão
          setSelectedContact(mockContactsWithCurrentUser[0]);
        } else {
          // Filtrar apenas administradores e treinadores
          const filteredContacts = data.filter(
            profile => profile.role === 'admin' || profile.role === 'trainer'
          );
          setContacts(filteredContacts);
          // Selecionar o primeiro contato por padrão
          if (filteredContacts.length > 0) {
            setSelectedContact(filteredContacts[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        // Usar dados mock
        setContacts(mockUsers);
        setSelectedContact(mockUsers[0]);
      } finally {
        setDataLoading(false);
      }
    };

    // Inicializar WebSocket
    try {
      const ws = messagesAPI.connectWebSocket(user.id);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          // Adicionar nova mensagem à lista
          setMessages(prev => [...prev, data.data]);
          
          // Marcar como lida se for do contato selecionado
          if (selectedContact && data.data.sender_id === selectedContact.id) {
            messagesAPI.markAsRead(data.data.id);
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket fechado');
      };
      
      setWebsocket(ws);
    } catch (error) {
      console.error('Erro ao inicializar WebSocket:', error);
    }

    loadContacts();

    // Limpar WebSocket ao desmontar
    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [isAuthenticated, user]);

  // Carregar mensagens quando o contato selecionado mudar
  useEffect(() => {
    if (!selectedContact || !user) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await messagesAPI.getConversation(selectedContact.id);
        
        if (error || !data) {
          console.error('Erro ao carregar mensagens:', error);
          // Usar dados mock
          const mockMessagesWithIds = mockMessages.map(msg => ({
            ...msg,
            sender_id: msg.sender_id === 'current_user' ? user.id : msg.sender_id,
            receiver_id: msg.receiver_id === 'current_user' ? user.id : msg.receiver_id
          }));
          setMessages(mockMessagesWithIds);
        } else {
          setMessages(data);
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        // Usar dados mock
        const mockMessagesWithIds = mockMessages.map(msg => ({
          ...msg,
          sender_id: msg.sender_id === 'current_user' ? user.id : msg.sender_id,
          receiver_id: msg.receiver_id === 'current_user' ? user.id : msg.receiver_id
        }));
        setMessages(mockMessagesWithIds);
      }
    };

    loadMessages();
  }, [selectedContact, user]);

  // Rolar para a última mensagem quando as mensagens mudarem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      // Enviar via API
      const { data, error } = await messagesAPI.sendMessage(selectedContact.id, newMessage);
      
      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        // Adicionar mensagem localmente mesmo com erro
        const mockMessage = {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          receiver_id: selectedContact.id,
          content: newMessage,
          created_at: new Date().toISOString(),
          is_read: false
        };
        setMessages(prev => [...prev, mockMessage]);
      } else if (data) {
        // Adicionar mensagem à lista
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Adicionar mensagem localmente mesmo com erro
      const mockMessage = {
        id: `local-${Date.now()}`,
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: false
      };
      setMessages(prev => [...prev, mockMessage]);
    } finally {
      // Limpar campo de mensagem
      setNewMessage('');
    }
  };

  // Renderizar conteúdo com base no estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="mb-4">Você precisa estar logado para acessar esta página.</p>
          <Button asChild>
            <a href="/login">Fazer Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mensagens</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lista de Contatos */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contatos</CardTitle>
            <CardDescription>Selecione um contato para conversar</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedContact?.id === contact.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={contact.avatar_url} alt={contact.nome} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contact.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.role === 'admin' ? 'Administrador' : 
                         contact.role === 'trainer' ? 'Treinador' : 
                         contact.role}
                      </p>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && !dataLoading && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum contato disponível
                  </p>
                )}
                {dataLoading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Área de Mensagens */}
        <Card className="md:col-span-2">
          <CardHeader>
            {selectedContact ? (
              <>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedContact.avatar_url} alt={selectedContact.nome} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedContact.nome}</CardTitle>
                    <CardDescription>
                      {selectedContact.role === 'admin' ? 'Administrador' : 
                       selectedContact.role === 'trainer' ? 'Treinador' : 
                       selectedContact.role}
                    </CardDescription>
                  </div>
                </div>
              </>
            ) : (
              <CardTitle>Selecione um contato</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {selectedContact ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender_id === user.id;
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Selecione um contato para iniciar uma conversa</p>
              </div>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
            {selectedContact && (
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Messages;

