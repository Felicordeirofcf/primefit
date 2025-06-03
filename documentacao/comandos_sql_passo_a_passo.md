-- ========================================
-- SCRIPT SIMPLES: ADICIONAR COLUNA ROLE
-- Execute UM comando por vez no Supabase
-- ========================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. ADICIONAR COLUNA ROLE (SE NÃO EXISTIR)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'cliente';

-- 3. VERIFICAR SE COLUNA FOI CRIADA
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- 4. DEFINIR ADMIN (SUBSTITUA SEU EMAIL)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'felicordeirofcf@gmail.com';

-- 5. VERIFICAR RESULTADO
SELECT email, nome, role 
FROM profiles 
WHERE role = 'admin';

-- ========================================
-- COMANDOS ÚTEIS APÓS CONFIGURAÇÃO
-- ========================================

-- Ver todos os usuários:
-- SELECT id, email, nome, role FROM profiles ORDER BY email;

-- Promover outro usuário:
-- UPDATE profiles SET role = 'admin' WHERE email = 'outro@email.com';

-- Voltar para cliente:
-- UPDATE profiles SET role = 'cliente' WHERE email = 'usuario@email.com';

