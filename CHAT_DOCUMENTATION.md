# Documentação da Implementação do Chat em Tempo Real

Este documento descreve a implementação do sistema de chat em tempo real no projeto PrimeFit, utilizando Supabase Realtime.

## Visão Geral

O objetivo foi transformar o sistema de mensagens existente, que utilizava dados simulados, em um chat funcional e instantâneo entre clientes e administradores/trainers.

## Estrutura da Tabela Supabase

Foi criada (ou deve ser criada usando o script fornecido) uma tabela `mensagens` no schema `public` do Supabase com a seguinte estrutura:

```sql
CREATE TABLE IF NOT EXISTS public.mensagens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (content <> "),
    is_read boolean DEFAULT false NOT NULL
);
```

**Campos:**

*   `id`: Identificador único da mensagem (UUID).
*   `created_at`: Timestamp de criação da mensagem.
*   `sender_id`: UUID do remetente (referencia `auth.users`).
*   `receiver_id`: UUID do destinatário (referencia `auth.users`).
*   `content`: Texto da mensagem.
*   `is_read`: Booleano indicando se o destinatário leu a mensagem.

**Índices:**

Foram criados índices nas colunas `sender_id`, `receiver_id` e `created_at` para otimizar as consultas.

**Row Level Security (RLS):**

Políticas de RLS foram implementadas para garantir que:

1.  Usuários autenticados só possam visualizar mensagens onde são remetentes ou destinatários.
2.  Usuários autenticados só possam inserir mensagens onde são os remetentes.
3.  (Opcional no script, mas implementado na lógica do app) Usuários possam marcar mensagens *recebidas* por eles como lidas.

**Realtime:**

A tabela `mensagens` foi adicionada à publicação `supabase_realtime` para habilitar a funcionalidade de tempo real.

O script SQL completo para criar e configurar a tabela está em `backend/sql/create_messages_table.sql`.

## Implementação no Frontend (React)

### 1. Painel do Cliente (`frontend/src/pages/dashboard/Messages.jsx`)

*   **Estado:** Gerencia o estado das conversas, mensagens da conversa ativa, estado de carregamento, erros, nova mensagem e cache de perfis de usuários.
*   **Busca de Dados:** Ao montar, busca todas as mensagens do usuário logado, agrupa-as por conversa (com o outro participante) e busca os perfis dos outros usuários.
*   **Realtime:**
    *   Inscreve-se no canal `public:mensagens` do Supabase.
    *   Escuta por eventos `INSERT` na tabela `mensagens`.
    *   Ao receber uma nova mensagem relevante, atualiza o estado das conversas e, se for da conversa ativa, atualiza as mensagens exibidas.
    *   Busca o perfil do usuário se for uma nova conversa.
*   **Envio de Mensagens:** Insere uma nova linha na tabela `mensagens` com o `sender_id` do usuário logado e o `receiver_id` do usuário da conversa ativa.
*   **Seleção de Conversa:** Permite ao usuário clicar em uma conversa na lista para torná-la ativa, exibindo suas mensagens.
*   **Marcação como Lida:** Ao selecionar uma conversa ou receber uma mensagem na conversa ativa, chama a função `markAsRead` que atualiza a interface e envia uma requisição `UPDATE` ao Supabase para marcar as mensagens como lidas no banco de dados.
*   **Interface:** Exibe a lista de conversas à esquerda e a conversa ativa à direita, com rolagem automática para a última mensagem.

### 2. Painel do Administrador (`frontend/src/pages/PainelAdmin.jsx` e `frontend/src/components/AdminChat.jsx`)

*   **Componente Dedicado:** Foi criado o componente `AdminChat.jsx` para encapsular a lógica do chat no painel administrativo.
*   **Integração:** O componente `AdminChat.jsx` é importado e renderizado dentro de `PainelAdmin.jsx`.
*   **Funcionalidade (AdminChat.jsx):**
    *   Similar ao `Messages.jsx`, mas adaptado para a visão do administrador.
    *   Busca todas as conversas onde o administrador é participante.
    *   Agrupa as conversas por cliente.
    *   Busca os perfis dos clientes.
    *   Inscreve-se em um canal Realtime (ex: `public:mensagens:admin`) para receber atualizações.
    *   Permite ao administrador selecionar uma conversa com um cliente específico.
    *   Permite ao administrador enviar mensagens para o cliente selecionado.
    *   Implementa a marcação de mensagens como lidas (mensagens recebidas pelo admin).
    *   Exibe a lista de conversas com clientes e a conversa ativa.

### 3. Utilitários (`frontend/src/utils/formatDate.js`)

*   A função `formatDate` foi extraída para um arquivo utilitário para ser reutilizada em ambos os componentes de chat, garantindo consistência na formatação das datas/horas das mensagens.

## Configuração Supabase

*   A conexão com o Supabase é configurada no arquivo `frontend/src/supabaseClient.js`, utilizando as variáveis de ambiente (ou diretamente no código, como no exemplo) para a URL e a chave anônima (anon key) do projeto Supabase.
*   É crucial que a tabela `profiles` (ou similar) exista e contenha informações como `username` e `avatar_url`, referenciando o `id` de `auth.users`.

## Próximos Passos e Considerações

*   **Testes:** Realizar testes extensivos com múltiplos usuários (cliente e admin) para garantir a robustez da comunicação em tempo real.
*   **Tratamento de Erros:** Melhorar o tratamento de erros e feedback para o usuário em caso de falhas na conexão ou envio/recebimento de mensagens.
*   **Notificações:** Implementar notificações (visuais ou sonoras) para novas mensagens, especialmente quando a janela do chat não está ativa.
*   **Performance:** Para um grande volume de mensagens, considerar estratégias de paginação ou carregamento sob demanda.
*   **Segurança:** Revisar e garantir que as políticas de RLS estão corretamente configuradas e adequadas aos requisitos de segurança da aplicação.
*   **Variáveis de Ambiente:** Mover as chaves do Supabase para variáveis de ambiente (`.env`) em vez de deixá-las diretamente no código.
*   **Backend API (Opcional):** Embora o Realtime funcione diretamente no frontend, algumas lógicas (como buscar perfis ou realizar ações complexas) podem ser movidas para a API backend (`/backend`) para maior segurança e controle.

