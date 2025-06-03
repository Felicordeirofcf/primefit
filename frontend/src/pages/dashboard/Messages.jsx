import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

const Messages = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeConversation, setActiveConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  // Dados simulados para demonstração
  useEffect(() => {
    // Simulação de chamada à API
    setTimeout(() => {
      const mockMessages = [
        {
          id: 1,
          with: {
            id: 101,
            name: 'Ricardo Oliveira',
            role: 'Personal Trainer',
            avatar: null
          },
          messages: [
            {
              id: 1001,
              sender: 'trainer',
              content: 'Olá João! Como está se sentindo após o treino de ontem?',
              timestamp: '2025-05-29T14:30:00',
              read: true
            },
            {
              id: 1002,
              sender: 'user',
              content: 'Estou me sentindo bem! Tive um pouco de dor muscular nas pernas, mas nada fora do normal.',
              timestamp: '2025-05-29T15:45:00',
              read: true
            },
            {
              id: 1003,
              sender: 'trainer',
              content: 'Ótimo! É normal sentir um pouco de dor muscular, especialmente depois de aumentarmos a carga nos agachamentos. Lembre-se de fazer os alongamentos que te passei e beber bastante água.',
              timestamp: '2025-05-29T16:10:00',
              read: true
            },
            {
              id: 1004,
              sender: 'user',
              content: 'Sim, estou fazendo os alongamentos e bebendo água como recomendado. Quando teremos nossa próxima sessão?',
              timestamp: '2025-05-29T16:30:00',
              read: true
            },
            {
              id: 1005,
              sender: 'trainer',
              content: 'Nossa próxima sessão está marcada para amanhã às 18h. Vamos focar em exercícios para a parte superior do corpo. Está confirmado?',
              timestamp: '2025-05-29T16:45:00',
              read: false
            }
          ],
          unread: 1,
          lastMessage: {
            content: 'Nossa próxima sessão está marcada para amanhã às 18h. Vamos focar em exercícios para a parte superior do corpo. Está confirmado?',
            timestamp: '2025-05-29T16:45:00'
          }
        },
        {
          id: 2,
          with: {
            id: 102,
            name: 'Ana Souza',
            role: 'Nutricionista',
            avatar: null
          },
          messages: [
            {
              id: 2001,
              sender: 'nutritionist',
              content: 'Bom dia João! Como está indo com o novo plano alimentar?',
              timestamp: '2025-05-28T09:15:00',
              read: true
            },
            {
              id: 2002,
              sender: 'user',
              content: 'Bom dia Ana! Estou conseguindo seguir bem o plano, mas tenho sentido um pouco de fome à tarde.',
              timestamp: '2025-05-28T10:30:00',
              read: true
            },
            {
              id: 2003,
              sender: 'nutritionist',
              content: 'Entendo. Vamos ajustar o lanche da tarde para incluir mais proteínas e fibras, isso deve ajudar a controlar a fome. Pode me enviar fotos das suas refeições dos últimos dias?',
              timestamp: '2025-05-28T11:00:00',
              read: true
            }
          ],
          unread: 0,
          lastMessage: {
            content: 'Entendo. Vamos ajustar o lanche da tarde para incluir mais proteínas e fibras, isso deve ajudar a controlar a fome. Pode me enviar fotos das suas refeições dos últimos dias?',
            timestamp: '2025-05-28T11:00:00'
          }
        },
        {
          id: 3,
          with: {
            id: 103,
            name: 'Suporte PrimeFit',
            role: 'Atendimento',
            avatar: null
          },
          messages: [
            {
              id: 3001,
              sender: 'support',
              content: 'Olá João! Bem-vindo ao PrimeFit. Estamos aqui para ajudar com qualquer dúvida sobre a plataforma.',
              timestamp: '2025-05-25T10:00:00',
              read: true
            },
            {
              id: 3002,
              sender: 'user',
              content: 'Olá! Obrigado pelo suporte. Por enquanto está tudo certo, a plataforma é bem intuitiva.',
              timestamp: '2025-05-25T10:30:00',
              read: true
            },
            {
              id: 3003,
              sender: 'support',
              content: 'Ótimo! Caso precise de ajuda, não hesite em nos contatar. Tenha um excelente dia!',
              timestamp: '2025-05-25T10:45:00',
              read: true
            }
          ],
          unread: 0,
          lastMessage: {
            content: 'Ótimo! Caso precise de ajuda, não hesite em nos contatar. Tenha um excelente dia!',
            timestamp: '2025-05-25T10:45:00'
          }
        }
      ]
      
      setMessages(mockMessages)
      setActiveConversation(mockMessages[0])
      setLoading(false)
    }, 1500)
  }, [])
  
  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    
    // Se for hoje, mostrar apenas a hora
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    
    // Se for ontem
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    // Outros dias
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + 
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Função para enviar mensagem
  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    setSending(true)
    
    // Simulação de envio para API
    setTimeout(() => {
      const updatedMessages = [...messages]
      const conversationIndex = updatedMessages.findIndex(m => m.id === activeConversation.id)
      
      if (conversationIndex !== -1) {
        const newMsg = {
          id: Date.now(),
          sender: 'user',
          content: newMessage,
          timestamp: new Date().toISOString(),
          read: false
        }
        
        updatedMessages[conversationIndex].messages.push(newMsg)
        updatedMessages[conversationIndex].lastMessage = {
          content: newMessage,
          timestamp: new Date().toISOString()
        }
        
        setMessages(updatedMessages)
        setActiveConversation({
          ...activeConversation,
          messages: [...activeConversation.messages, newMsg],
          lastMessage: {
            content: newMessage,
            timestamp: new Date().toISOString()
          }
        })
        
        setNewMessage('')
        setSending(false)
        
        // Simular resposta automática após 2 segundos
        setTimeout(() => {
          const autoReply = {
            id: Date.now() + 1,
            sender: activeConversation.with.role === 'Personal Trainer' ? 'trainer' : 
                   activeConversation.with.role === 'Nutricionista' ? 'nutritionist' : 'support',
            content: `Obrigado pela sua mensagem! ${activeConversation.with.name} responderá em breve.`,
            timestamp: new Date().toISOString(),
            read: false
          }
          
          const updatedMsgs = [...messages]
          const convIndex = updatedMsgs.findIndex(m => m.id === activeConversation.id)
          
          if (convIndex !== -1) {
            updatedMsgs[convIndex].messages.push(autoReply)
            updatedMsgs[convIndex].lastMessage = {
              content: autoReply.content,
              timestamp: autoReply.timestamp
            }
            
            setMessages(updatedMsgs)
            setActiveConversation({
              ...activeConversation,
              messages: [...activeConversation.messages, autoReply],
              lastMessage: {
                content: autoReply.content,
                timestamp: autoReply.timestamp
              }
            })
          }
        }, 2000)
      }
    }, 500)
  }
  
  // Função para marcar mensagens como lidas
  const markAsRead = (conversationId) => {
    const updatedMessages = [...messages]
    const conversationIndex = updatedMessages.findIndex(m => m.id === conversationId)
    
    if (conversationIndex !== -1) {
      updatedMessages[conversationIndex].unread = 0
      updatedMessages[conversationIndex].messages.forEach(msg => {
        if (msg.sender !== 'user') {
          msg.read = true
        }
      })
      
      setMessages(updatedMessages)
      
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation({
          ...activeConversation,
          unread: 0,
          messages: activeConversation.messages.map(msg => {
            if (msg.sender !== 'user') {
              return { ...msg, read: true }
            }
            return msg
          })
        })
      }
    }
  }
  
  // Função para selecionar uma conversa
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    markAsRead(conversation.id)
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <button className="btn btn-primary">Nova Mensagem</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de conversas */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar conversas..."
                className="input w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              {messages.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    activeConversation?.id === conversation.id
                      ? 'bg-primary-100 text-primary-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3">
                      {conversation.with.avatar ? (
                        <img src={conversation.with.avatar} alt={conversation.with.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.with.name}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.lastMessage.timestamp).split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
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
        </div>
        
        {/* Conversa ativa */}
        <div className="lg:col-span-3">
          {activeConversation ? (
            <div className="card flex flex-col h-[600px]">
              {/* Cabeçalho da conversa */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3">
                  {activeConversation.with.avatar ? (
                    <img src={activeConversation.with.avatar} alt={activeConversation.with.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{activeConversation.with.name}</h3>
                  <p className="text-xs text-gray-500">{activeConversation.with.role}</p>
                </div>
              </div>
              
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 flex justify-end items-center ${
                          message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDate(message.timestamp)}
                        {message.sender === 'user' && (
                          <span className="ml-1">
                            {message.read ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Formulário de envio */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="input flex-1 mr-2"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500">Selecione uma conversa para visualizar as mensagens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
