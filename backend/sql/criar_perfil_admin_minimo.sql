-- ========================================
-- SCRIPT MÍNIMO - APENAS COLUNAS ESSENCIAIS
-- SEM CONSTRAINTS PROBLEMÁTICAS
-- Felipe Cordeiro Ferreira
-- ========================================

-- 1. DESABILITAR RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR ESTRUTURA DA TABELA (para ver colunas obrigatórias)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 3. CRIAR PERFIL COM APENAS COLUNAS ESSENCIAIS
INSERT INTO profiles (
    id,
    email,
    nome,
    role
) VALUES (
    'c0ee220f-9b71-491a-872d-b2f1ec2c9b80',
    'felpcordeirofcf@gmail.com',
    'Felipe Cordeiro Ferreira',
    'admin'
);

-- 4. VERIFICAR SE FOI CRIADO
SELECT 
    'PERFIL MÍNIMO CRIADO' as status,
    id,
    email,
    nome,
    role
FROM profiles 
WHERE id = 'c0ee220f-9b71-491a-872d-b2f1ec2c9b80';

-- 5. CRIAR FUNÇÃO is_admin SIMPLES
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TESTAR FUNÇÃO
SELECT 
    'TESTE FUNÇÃO' as status,
    is_admin('c0ee220f-9b71-491a-872d-b2f1ec2c9b80') as felipe_eh_admin;

-- 7. REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS BÁSICAS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. TESTE FINAL
SELECT 
    'TESTE FINAL' as status,
    is_admin('c0ee220f-9b71-491a-872d-b2f1ec2c9b80') as resultado;

-- 10. TESTE COM auth.uid() (quando logado)
SELECT 
    'QUANDO LOGADO' as info,
    auth.uid() as meu_id,
    is_admin(auth.uid()) as sou_admin;

-- ========================================
-- SE AINDA DER ERRO, TENTE VERSÃO ULTRA MÍNIMA:
-- ========================================

-- VERSÃO ULTRA MÍNIMA (descomente se necessário):
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- 
-- INSERT INTO profiles (id, email, role) 
-- VALUES (
--     'c0ee220f-9b71-491a-872d-b2f1ec2c9b80',
--     'felpcordeirofcf@gmail.com', 
--     'admin'
-- );
-- 
-- SELECT * FROM profiles WHERE id = 'c0ee220f-9b71-491a-872d-b2f1ec2c9b80';
-- 
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RESULTADO ESPERADO:
-- Passo 4: Perfil criado com role = admin
-- Passo 6: felipe_eh_admin = true
-- Passo 9: resultado = true
-- Passo 10: sou_admin = true
-- ========================================

