-- Script SQL para excluir todas as tabelas existentes e recriar a estrutura do banco de dados
-- Compatível com PostgreSQL

-- Desativar verificações de chave estrangeira durante a operação
SET session_replication_role = 'replica';

-- Excluir todas as tabelas existentes (se existirem)
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS treinos_enviados CASCADE;
DROP TABLE IF EXISTS progresso CASCADE;
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS mensagens CASCADE;
DROP TABLE IF EXISTS assinaturas CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS comments CASCADE;

-- Reativar verificações de chave estrangeira
SET session_replication_role = 'origin';

-- Criar tabela de usuários
CREATE TABLE usuarios (
    id VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    senha_hash VARCHAR(255),
    tipo_usuario VARCHAR(50) DEFAULT 'client',
    role VARCHAR(50) DEFAULT 'client',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endereco VARCHAR(255),
    cidade VARCHAR(255),
    cep VARCHAR(20),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    treino_pdf VARCHAR(255)
);

-- Criar tabela de treinos enviados
CREATE TABLE treinos_enviados (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) REFERENCES usuarios(id),
    nome_arquivo VARCHAR(255),
    url_pdf VARCHAR(255),
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de progresso
CREATE TABLE progresso (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) REFERENCES usuarios(id),
    data_medicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peso FLOAT,
    altura FLOAT,
    percentual_gordura FLOAT,
    massa_muscular FLOAT
);

-- Criar tabela de avaliações
CREATE TABLE avaliacoes (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) REFERENCES usuarios(id),
    tipo VARCHAR(50),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peso FLOAT,
    altura FLOAT,
    percentual_gordura FLOAT,
    massa_muscular FLOAT,
    status VARCHAR(50) DEFAULT 'pendente'
);

-- Criar tabela de mensagens
CREATE TABLE mensagens (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) REFERENCES usuarios(id),
    assunto VARCHAR(255),
    conteudo TEXT,
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    respondida BOOLEAN DEFAULT FALSE
);

-- Criar tabela de assinaturas
CREATE TABLE assinaturas (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) REFERENCES usuarios(id),
    plano_id VARCHAR(255),
    status VARCHAR(50),
    data_inicio TIMESTAMP,
    data_fim TIMESTAMP,
    valor_pago FLOAT
);

-- Criar tabela de pagamentos
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES usuarios(id),
    payment_method VARCHAR(50),
    amount FLOAT,
    transaction_id VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de planos
CREATE TABLE plans (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price FLOAT,
    duration_months INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Criar tabela de conteúdo
CREATE TABLE content (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    summary TEXT,
    body TEXT,
    author_id VARCHAR(255) REFERENCES usuarios(id),
    category VARCHAR(100),
    tags VARCHAR(255),
    image_url VARCHAR(255),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de comentários
CREATE TABLE comments (
    id VARCHAR(255) PRIMARY KEY,
    content_id VARCHAR(255) REFERENCES content(id),
    user_id VARCHAR(255) REFERENCES usuarios(id),
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário administrador para testes
INSERT INTO usuarios (
    id, 
    nome, 
    email, 
    senha_hash, 
    tipo_usuario, 
    role,
    is_admin,
    created_at, 
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Administrador', 
    'admin@primefit.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: 'senha'
    'admin', 
    'admin',
    TRUE,
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);

-- Inserir usuário cliente para testes
INSERT INTO usuarios (
    id, 
    nome, 
    email, 
    senha_hash, 
    tipo_usuario, 
    role,
    created_at, 
    updated_at,
    endereco,
    cidade,
    cep,
    telefone,
    whatsapp
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 
    'Cliente Teste', 
    'cliente@exemplo.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: 'senha'
    'client', 
    'client',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'Rua Exemplo, 123',
    'São Paulo',
    '01234-567',
    '(11) 98765-4321',
    '(11) 98765-4321'
);

-- Inserir plano para testes
INSERT INTO plans (
    id,
    name,
    description,
    price,
    duration_months,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'Plano Premium',
    'Acesso completo a todos os recursos',
    99.90,
    1,
    TRUE
);

-- Inserir assinatura para testes
INSERT INTO assinaturas (
    id,
    usuario_id,
    plano_id,
    status,
    data_inicio,
    data_fim,
    valor_pago
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'ativa',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    99.90
);
