-- ========================================
-- SCRIPT FINAL: DEFINIR CONTA ATUAL COMO ADMIN
-- Para resolver problema de conta diferente
-- ========================================

-- 1. CRIAR FUNÇÃO is_admin_by_email (se não existir)
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = user_email AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. DEFINIR CONTA ATUAL COMO ADMIN
-- SUBSTITUA O ID PELA SUA CONTA ATUAL
UPDATE profiles 
SET 
    role = 'admin', 
    email = 'felpcordeirofcf@gmail.com'
WHERE id = 'a2b60a49-9c0f-425e-808e-346c4fbae687';

-- 3. VERIFICAR SE FUNCIONOU
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    id, 
    email, 
    nome, 
    role,
    is_admin_by_email(email) as eh_admin_por_email
FROM profiles 
WHERE id = 'a2b60a49-9c0f-425e-808e-346c4fbae687';

-- 4. TESTAR FUNÇÃO COM SEU EMAIL
SELECT 
    'TESTE POR EMAIL' as status,
    is_admin_by_email('felpcordeirofcf@gmail.com') as resultado;

-- ========================================
-- RESULTADO ESPERADO:
-- Passo 3: role = 'admin', eh_admin_por_email = true
-- Passo 4: resultado = true
-- ========================================

-- COMANDOS PARA OUTRAS CONTAS (se necessário):
-- Para definir qualquer conta como admin, use:
-- UPDATE profiles SET role = 'admin', email = 'felpcordeirofcf@gmail.com' WHERE id = 'SEU_ID_AQUI';

