# 🔧 TROUBLESHOOTING - CORREÇÕES TOKEN E ADMIN

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES:**

### **1. ERRO: "Token não encontrado" ainda aparece**

#### **Possíveis Causas:**
- Arquivo DashboardHome.jsx não foi substituído corretamente
- Cache do navegador não foi limpo
- Sessão do Supabase expirada

#### **Soluções:**
```bash
# 1. Verificar se arquivo foi substituído
ls -la frontend/src/pages/dashboard/DashboardHome.jsx

# 2. Limpar cache do navegador
# Pressione Ctrl+Shift+R ou F5 várias vezes

# 3. Limpar storage do navegador
# No console (F12):
localStorage.clear()
sessionStorage.clear()
location.reload()
```

#### **Verificação:**
```javascript
// No console (F12), deve aparecer:
"Token obtido da sessão Supabase: Token encontrado"
// OU
"Token não encontrado - usando dados mock"
```

---

### **2. ERRO: "Acesso Negado" no painel admin**

#### **Possíveis Causas:**
- Arquivo AdminDashboard.jsx não foi substituído
- Função `is_admin_by_email` não existe no Supabase
- Email não está definido como admin

#### **Soluções:**

**A. Verificar arquivo substituído:**
```bash
grep -n "is_admin_by_email" frontend/src/pages/dashboard/AdminDashboard.jsx
# Deve retornar linhas com a função
```

**B. Verificar função no Supabase:**
```sql
-- Execute no SQL Editor do Supabase:
SELECT is_admin_by_email('felpcordeirofcf@gmail.com') as resultado;
-- Deve retornar: true
```

**C. Se função não existir, criar:**
```sql
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = user_email AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Verificação:**
```javascript
// No console (F12), deve aparecer:
"Verificando status admin para: felpcordeirofcf@gmail.com"
"Resultado verificação admin: true"
```

---

### **3. ERRO: Aplicação não inicia após substituir arquivos**

#### **Possíveis Causas:**
- Erro de sintaxe nos arquivos
- Importações incorretas
- Dependências em falta

#### **Soluções:**

**A. Verificar erros de sintaxe:**
```bash
# No terminal, verificar logs de erro
npm start
# Procurar por erros de compilação
```

**B. Verificar importações:**
```bash
# Verificar se supabase está importado
grep -n "import.*supabase" frontend/src/pages/dashboard/AdminDashboard.jsx
# Deve retornar linha com import
```

**C. Reinstalar dependências:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

### **4. ERRO: Dados não carregam no dashboard**

#### **Possíveis Causas:**
- Backend não está rodando
- Token inválido
- Problemas de CORS

#### **Soluções:**

**A. Verificar se está usando dados mock:**
```javascript
// No console (F12), deve aparecer:
"Token não encontrado - usando dados mock para desenvolvimento"
// OU
"API não disponível, usando dados mock"
```

**B. Verificar URL da API:**
```bash
# Verificar variável de ambiente
grep -n "VITE_API_URL" frontend/.env
# OU verificar no código:
grep -n "API_URL" frontend/src/pages/dashboard/DashboardHome.jsx
```

---

### **5. ERRO: Console mostra muitos erros**

#### **Filtrar logs importantes:**
```javascript
// No console (F12), filtrar por:
// - "Auth state changed"
// - "Verificando status admin"
// - "Token obtido"
// - "Resultado verificação admin"
```

#### **Logs esperados (sucesso):**
```
✅ Auth state changed: SIGNED_IN c0ee220f-9b71-491a-872d-b2f1ec2c9b80
✅ Verificando status admin para: felpcordeirofcf@gmail.com
✅ Resultado verificação admin: true
✅ Token obtido da sessão Supabase: Token encontrado
✅ Perfil carregado com sucesso
```

---

### **6. ERRO: Função is_admin_by_email não funciona**

#### **Recriar função completa:**
```sql
-- Execute no SQL Editor do Supabase:

-- 1. Remover função antiga (se existir)
DROP FUNCTION IF EXISTS is_admin_by_email(TEXT);

-- 2. Criar função nova
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Contar quantos admins existem com este email
    SELECT COUNT(*) INTO admin_count
    FROM profiles 
    WHERE email = user_email AND role = 'admin';
    
    -- Retornar true se encontrou pelo menos 1
    RETURN admin_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar função
SELECT is_admin_by_email('felpcordeirofcf@gmail.com') as teste;
```

---

### **7. ERRO: Perfil não tem role admin**

#### **Forçar role admin:**
```sql
-- Execute no SQL Editor do Supabase:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'felpcordeirofcf@gmail.com';

-- Verificar se funcionou:
SELECT email, nome, role 
FROM profiles 
WHERE email = 'felpcordeirofcf@gmail.com';
```

---

## 🔍 **COMANDOS DE DIAGNÓSTICO:**

### **Verificar arquivos substituídos:**
```bash
# Verificar data de modificação
ls -la frontend/src/context/AuthContext.jsx
ls -la frontend/src/pages/dashboard/DashboardHome.jsx
ls -la frontend/src/pages/dashboard/AdminDashboard.jsx
```

### **Verificar conteúdo dos arquivos:**
```bash
# Verificar se contém as correções
grep -n "is_admin_by_email" frontend/src/pages/dashboard/AdminDashboard.jsx
grep -n "getAuthToken" frontend/src/pages/dashboard/DashboardHome.jsx
grep -n "is_admin_by_email" frontend/src/context/AuthContext.jsx
```

### **Verificar Supabase:**
```sql
-- Verificar se perfil existe
SELECT * FROM profiles WHERE email = 'felpcordeirofcf@gmail.com';

-- Verificar função
SELECT is_admin_by_email('felpcordeirofcf@gmail.com');

-- Verificar RLS
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

---

## 📞 **QUANDO PEDIR AJUDA:**

Se após seguir todos os passos ainda houver problemas, forneça:

1. **Logs do console** (F12 → Console)
2. **Resultado dos comandos SQL** no Supabase
3. **Versão do Node.js**: `node --version`
4. **Versão do npm**: `npm --version`
5. **Sistema operacional** utilizado

---

## 🎯 **CHECKLIST FINAL:**

- [ ] Arquivos substituídos corretamente
- [ ] Cache do navegador limpo
- [ ] Função `is_admin_by_email` criada no Supabase
- [ ] Email definido como admin na tabela profiles
- [ ] Aplicação reiniciada
- [ ] Console sem erros críticos
- [ ] Dashboard carrega sem erro de token
- [ ] Painel admin acessível

**Se todos os itens estão marcados, o sistema deve estar funcionando perfeitamente!** ✅

