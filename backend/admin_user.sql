-- Script SQL para adicionar um usuário administrador ao banco de dados PrimeFit
-- Este script é compatível com a estrutura de tabela mostrada nas imagens

-- Adiciona um usuário administrador
INSERT INTO usuarios (
    id, 
    nome, 
    email, 
    senha_hash,  -- Coluna para hash de senha
    tipo_usuario,
    is_admin,    -- Coluna booleana para indicar admin
    created_at, 
    updated_at,
    endereco,
    cidade,
    cep,
    telefone,
    whatsapp,
    treino_pdf,
    role
) VALUES (
    'admin-uuid-123456789', 
    'Administrador PrimeFit', 
    'admin@primefit.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: 'senha'
    'admin',
    TRUE,
    NOW(), 
    NOW(),
    'Rua da Academia, 123',
    'São Paulo',
    '01234-567',
    '(11) 98765-4321',
    '(11) 98765-4321',
    NULL,  -- Sem treino PDF associado
    'admin'
);

-- Caso a tabela use password_hash em vez de senha_hash, use este comando:
INSERT INTO usuarios (
    id, 
    nome, 
    email, 
    password_hash,  -- Coluna para hash de senha
    tipo_usuario,
    is_admin,    -- Coluna booleana para indicar admin
    created_at, 
    updated_at,
    endereco,
    cidade,
    cep,
    telefone,
    whatsapp,
    treino_pdf,
    role
) VALUES (
    'admin-uuid-987654321', 
    'Administrador Sistema', 
    'sistema@primefit.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: 'senha'
    'admin',
    TRUE,
    NOW(), 
    NOW(),
    'Rua da Academia, 123',
    'São Paulo',
    '01234-567',
    '(11) 98765-4321',
    '(11) 98765-4321',
    NULL,  -- Sem treino PDF associado
    'admin'
);

-- Se a tabela for profiles em vez de usuarios, use este comando:
INSERT INTO profiles (
    id, 
    nome, 
    email, 
    password_hash,
    tipo_usuario,
    criado_em,
    ultimo_login
) VALUES (
    'admin-uuid-555555555', 
    'Admin Profiles', 
    'admin_profiles@primefit.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: 'senha'
    'admin',
    NOW(), 
    NOW()
);

-- Nota: Execute apenas o comando apropriado para sua estrutura de banco de dados.
-- Você pode verificar qual tabela e colunas estão sendo usadas com:
-- SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';
