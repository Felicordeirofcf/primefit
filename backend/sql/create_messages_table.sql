-- Script SQL para criar a tabela 'mensagens' no Supabase

-- Garante que a extensão uuid-ossp esteja habilitada (necessária para gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cria a tabela 'mensagens'
CREATE TABLE IF NOT EXISTS public.mensagens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Chave estrangeira para o remetente
    receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Chave estrangeira para o destinatário
    content text NOT NULL CHECK (content <> ''), -- Conteúdo da mensagem, não pode ser vazio
    is_read boolean DEFAULT false NOT NULL -- Indica se a mensagem foi lida pelo destinatário
);

-- Índices para otimizar consultas comuns
CREATE INDEX IF NOT EXISTS idx_mensagens_sender_id ON public.mensagens(sender_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_receiver_id ON public.mensagens(receiver_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON public.mensagens(created_at DESC);

-- Habilita Realtime para a tabela 'mensagens'
-- 1. Garante que a tabela esteja publicada para replicação
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;

-- 2. Define políticas de Row Level Security (RLS) - ESSENCIAL para segurança
-- Garante que RLS esteja habilitada na tabela
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ver suas próprias mensagens (enviadas ou recebidas)
DROP POLICY IF EXISTS "Allow authenticated users to view their own messages" ON public.mensagens;
CREATE POLICY "Allow authenticated users to view their own messages"
    ON public.mensagens FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Política: Usuários autenticados podem inserir mensagens onde eles são o remetente
DROP POLICY IF EXISTS "Allow authenticated users to insert their own messages" ON public.mensagens;
CREATE POLICY "Allow authenticated users to insert their own messages"
    ON public.mensagens FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Política: Usuários podem marcar como lidas as mensagens recebidas por eles (opcional, pode ser feito via função)
-- DROP POLICY IF EXISTS "Allow users to mark received messages as read" ON public.mensagens;
-- CREATE POLICY "Allow users to mark received messages as read"
--     ON public.mensagens FOR UPDATE
--     USING (auth.uid() = receiver_id)
--     WITH CHECK (auth.uid() = receiver_id);

-- (Opcional) Adicionar uma coluna 'conversation_id' pode ajudar a agrupar mensagens
-- ALTER TABLE public.mensagens ADD COLUMN IF NOT EXISTS conversation_id uuid;
-- CREATE INDEX IF NOT EXISTS idx_mensagens_conversation_id ON public.mensagens(conversation_id);

-- Comentários sobre a estrutura:
-- sender_id e receiver_id: Referenciam a tabela auth.users. Ajuste se você usar uma tabela 'profiles' separada.
-- is_read: Controla o status de leitura.
-- RLS: Políticas de segurança são cruciais. As políticas acima permitem que usuários vejam/enviem apenas suas mensagens.
-- Realtime: A tabela é adicionada à publicação supabase_realtime.

-- Próximos passos após executar este script:
-- 1. Verificar se a tabela foi criada corretamente no Supabase.
-- 2. Implementar a lógica no frontend (React) para:
--    a. Buscar mensagens existentes.
--    b. Enviar novas mensagens (INSERT na tabela).
--    c. Escutar mudanças em tempo real (usando o canal Supabase).
--    d. Atualizar o estado da UI quando novas mensagens chegarem.
-- 3. Implementar a lógica no painel do administrador para visualizar e responder mensagens.

