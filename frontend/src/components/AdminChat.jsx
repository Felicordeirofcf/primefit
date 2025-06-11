import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { messagesAPI, profilesAPI } from '../api/apiClient';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, User } from 'lucide-react';

const mockUsers = [
  { id: 'user1', nome: 'Maria Silva', email: 'maria@example.com', role: 'user', avatar_url: null },
  { id: 'user2', nome: 'João Santos', email: 'joao@example.com', role: 'user', avatar_url: null },
  { id: 'user3', nome: 'Ana Oliveira', email: 'ana@example.com', role: 'user', avatar_url: null },
];

const mockMessages = {
  user1: [
    { id: '1', sender_id: 'user1', receiver_id: 'admin', content: 'Olá! Gostaria de saber mais sobre os planos de treino.', created_at: '2025-06-05T10:00:00Z', is_read: true },
    { id: '2', sender_id: 'admin', receiver_id: 'user1', content: 'Olá Maria! Claro, temos planos personalizados para diferentes objetivos. Qual é o seu objetivo principal?', created_at: '2025-06-05T10:05:00Z', is_read: true },
    { id: '3', sender_id: 'user1', receiver_id: 'admin', content: 'Quero perder peso e ganhar resistência.', created_at: '2025-06-05T10:10:00Z', is_read: false },
  ],
  user2: [
    { id: '4', sender_id: 'user2', receiver_id: 'admin', content: 'Bom dia! Preciso remarcar minha avaliação física.', created_at: '2025-06-04T09:00:00Z', is_read: true },
    { id: '5', sender_id: 'admin', receiver_id: 'user2', content: 'Bom dia João! Claro, para quando você gostaria de remarcar?', created_at: '2025-06-04T09:15:00Z', is_read: true },
  ],
  user3: [
    { id: '6', sender_id: 'user3', receiver_id: 'admin', content: 'Oi! Estou com dificuldade para acessar meu treino no aplicativo.', created_at: '2025-06-03T14:00:00Z', is_read: true },
  ],
};

const AdminChat = () => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !isAdmin) return;

    const loadClients = async () => {
      try {
        const { data, error } = await profilesAPI.getAllProfiles();
        if (error || !data) {
          console.error('Erro ao carregar clientes:', error);
          setClients(mockUsers);
          setSelectedClient(mockUsers[0]);
          const mockUnreadCounts = {};
          mockUsers.forEach(client => {
            const clientMessages = mockMessages[client.id] || [];
            mockUnreadCounts[client.id] = clientMessages.filter(
              msg => msg.sender_id === client.id && !msg.is_read
            ).length;
          });
          setUnreadCounts(mockUnreadCounts);
        } else {
          const filteredClients = data.filter(profile => profile.role === 'user');
          setClients(filteredClients);
          if (filteredClients.length > 0) {
            setSelectedClient(filteredClients[0]);
          }
          const unreadCountsObj = {};
          for (const client of filteredClients) {
            try {
              const { data: conversationData } = await messagesAPI.getConversation(client.id);
              if (conversationData) {
                unreadCountsObj[client.id] = conversationData.filter(
                  msg => msg.sender_id === client.id && !msg.is_read
                ).length;
              }
            } catch (error) {
              console.error(`Erro ao carregar mensagens para ${client.id}:`, error);
            }
          }
          setUnreadCounts(unreadCountsObj);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        setClients(mockUsers);
        setSelectedClient(mockUsers[0]);
      } finally {
        setDataLoading(false);
      }
    };

    try {
      const token = localStorage.getItem('auth_token');
      const ws = messagesAPI.connectWebSocket(user.id, token);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          const newMsg = data.data;
          if (selectedClient && (newMsg.sender_id === selectedClient.id || newMsg.receiver_id === selectedClient.id)) {
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.sender_id === selectedClient.id) {
              messagesAPI.markAsRead(newMsg.id);
            }
          }
          if (newMsg.sender_id !== user.id && !newMsg.is_read) {
            setUnreadCounts(prev => ({
              ...prev,
              [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
            }));
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

    loadClients();

    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [isAuthenticated, user, isAdmin]);

  useEffect(() => {
    if (!selectedClient || !user) return;
    const loadMessages = async () => {
      try {
        const { data, error } = await messagesAPI.getConversation(selectedClient.id);
        if (error || !data) {
          console.error('Erro ao carregar mensagens:', error);
          const clientMockMessages = mockMessages[selectedClient.id] || [];
          setMessages(clientMockMessages);
        } else {
          setMessages(data);
          const unreadMessages = data.filter(
            msg => msg.sender_id === selectedClient.id && !msg.is_read
          );
          for (const msg of unreadMessages) {
            await messagesAPI.markAsRead(msg.id);
          }
          if (unreadMessages.length > 0) {
            setUnreadCounts(prev => ({
              ...prev,
              [selectedClient.id]: 0
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        const clientMockMessages = mockMessages[selectedClient.id] || [];
        setMessages(clientMockMessages);
      }
    };
    loadMessages();
  }, [selectedClient, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;
    try {
      const { data, error } = await messagesAPI.sendMessage(selectedClient.id, newMessage);
      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        const mockMessage = {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          receiver_id: selectedClient.id,
          content: newMessage,
          created_at: new Date().toISOString(),
          is_read: false
        };
        setMessages(prev => [...prev, mockMessage]);
      } else if (data) {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const mockMessage = {
        id: `local-${Date.now()}`,
        sender_id: user.id,
        receiver_id: selectedClient.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: false
      };
      setMessages(prev => [...prev, mockMessage]);
    } finally {
      setNewMessage('');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (!isAuthenticated) return <div className="flex items-center justify-center h-screen">Você precisa estar logado.</div>;
  if (!isAdmin) return <div className="flex items-center justify-center h-screen">Acesso restrito.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Chat de Suporte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lista de Clientes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Selecione um cliente para conversar</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {clients.map((client) => (
                  <div 
                    key={client.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedClient?.id === client.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={client.avatar_url} alt={client.nome} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{client.nome}</p>
                        {unreadCounts[client.id] > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {unreadCounts[client.id]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && !dataLoading && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum cliente disponível
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
            {selectedClient ? (
              <>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedClient.avatar_url} alt={selectedClient.nome} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedClient.nome}</CardTitle>
                    <CardDescription>{selectedClient.email}</CardDescription>
                  </div>
                </div>
              </>
            ) : (
              <CardTitle>Selecione um cliente</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {selectedClient ? (
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
                <p className="text-muted-foreground">Selecione um cliente para iniciar uma conversa</p>
              </div>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
            {selectedClient && (
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

export default AdminChat;

