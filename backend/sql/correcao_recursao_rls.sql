-- ========================================
-- CORREÇÃO URGENTE: RECURSÃO INFINITA RLS
-- Execute este script no Supabase SQL Editor
-- ========================================

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 2. DESABILITAR RLS TEMPORARIAMENTE PARA CORRIGIR
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR SE A COLUNA ROLE EXISTE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'cliente';
    END IF;
END $$;

-- 4. ATUALIZAR USUÁRIOS SEM ROLE
UPDATE profiles 
SET role = 'cliente' 
WHERE role IS NULL OR role = '';

-- 5. DEFINIR ADMIN (SUBSTITUA SEU EMAIL)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'felicordeirofcf@gmail.com';

-- 6. CRIAR POLÍTICAS RLS SIMPLES (SEM RECURSÃO)

-- Política simples: usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Enable read access for own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update access for own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert access for own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Buscar role diretamente sem usar RLS
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'cliente') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRIAR VIEW PARA ADMINS ACESSAREM TODOS OS PERFIS
CREATE OR REPLACE VIEW admin_profiles AS
SELECT * FROM profiles
WHERE is_admin(auth.uid()) = true;

-- 10. GRANT PERMISSIONS
GRANT SELECT, UPDATE, INSERT ON profiles TO authenticated;
GRANT SELECT ON admin_profiles TO authenticated;

-- 11. VERIFICAR RESULTADO
SELECT 
    id,
    email, 
    nome, 
    role,
    created_at
FROM profiles 
WHERE email = 'felicordeirofcf@gmail.com';

-- 12. TESTAR FUNÇÃO ADMIN
SELECT is_admin(auth.uid()) as sou_admin;

-- 13. LISTAR TODAS AS POLÍTICAS ATIVAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- ========================================
-- COMANDOS DE VERIFICAÇÃO
-- ========================================

-- Ver todos os usuários (só funciona se você for admin):
-- SELECT * FROM admin_profiles;

-- Ver seu próprio perfil:
-- SELECT * FROM profiles WHERE id = auth.uid();

-- Verificar se é admin:
-- SELECT is_admin(auth.uid());

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================

-- 1. As políticas agora são SIMPLES e não causam recursão
-- 2. Usuários só podem ver/editar seu próprio perfil
-- 3. Admins usam a view 'admin_profiles' para ver todos
-- 4. A função is_admin() é SECURITY DEFINER (roda com privilégios elevados)
-- 5. Não há mais consultas recursivas na tabela profiles

