#!/bin/bash

# 🚀 Script de Aplicação Automática - PrimeFit
# Aplica todas as correções automaticamente

echo "🚀 Aplicando correções do PrimeFit..."
echo "===================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para perguntar ao usuário
ask_user() {
    local question=$1
    local default=$2
    
    echo -n -e "${BLUE}$question${NC} [${default}]: "
    read answer
    if [ -z "$answer" ]; then
        answer=$default
    fi
    echo $answer
}

echo -e "${GREEN}Este script vai aplicar as correções do PrimeFit automaticamente.${NC}"
echo ""

# Perguntar caminhos
PROJECT_PATH=$(ask_user "📁 Caminho do seu projeto PrimeFit" ".")
SERVER_PATH=$(ask_user "🌐 Caminho do servidor web (deixe vazio se não aplicar agora)" "")

echo ""
echo "📋 Configuração:"
echo "   Projeto: $PROJECT_PATH"
if [ ! -z "$SERVER_PATH" ]; then
    echo "   Servidor: $SERVER_PATH"
else
    echo "   Servidor: (não aplicar agora)"
fi
echo ""

# Confirmar
CONFIRM=$(ask_user "🤔 Continuar com a aplicação?" "s")
if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ] && [ "$CONFIRM" != "sim" ]; then
    echo -e "${YELLOW}❌ Aplicação cancelada pelo usuário.${NC}"
    exit 1
fi

echo ""
echo "🔄 Iniciando aplicação das correções..."

# 1. Verificar se o projeto existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Caminho do projeto não encontrado: $PROJECT_PATH${NC}"
    exit 1
fi

# 2. Aplicar componentes React
echo ""
echo -e "${BLUE}📱 Aplicando componentes React...${NC}"

DASHBOARD_PATH="$PROJECT_PATH/frontend/src/pages/dashboard"

if [ -d "$DASHBOARD_PATH" ]; then
    echo "   📁 Pasta dashboard encontrada: $DASHBOARD_PATH"
    
    # Backup dos arquivos atuais
    if [ -f "$DASHBOARD_PATH/DashboardHome.jsx" ]; then
        echo "   💾 Backup: DashboardHome.jsx → DashboardHome_backup.jsx"
        cp "$DASHBOARD_PATH/DashboardHome.jsx" "$DASHBOARD_PATH/DashboardHome_backup.jsx"
    fi
    
    if [ -f "$DASHBOARD_PATH/AdminDashboard.jsx" ]; then
        echo "   💾 Backup: AdminDashboard.jsx → AdminDashboard_backup.jsx"
        cp "$DASHBOARD_PATH/AdminDashboard.jsx" "$DASHBOARD_PATH/AdminDashboard_backup.jsx"
    fi
    
    # Copiar arquivos corrigidos
    echo "   📋 Copiando DashboardHome.jsx corrigido..."
    cp "frontend/src/pages/dashboard/DashboardHome.jsx" "$DASHBOARD_PATH/"
    
    echo "   📋 Copiando AdminDashboard.jsx corrigido..."
    cp "frontend/src/pages/dashboard/AdminDashboard.jsx" "$DASHBOARD_PATH/"
    
    echo -e "   ${GREEN}✅ Componentes aplicados com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  Pasta dashboard não encontrada: $DASHBOARD_PATH${NC}"
    echo "   Verifique o caminho do projeto."
fi

# 3. Gerar novo build
echo ""
echo -e "${BLUE}🔨 Gerando novo build...${NC}"

FRONTEND_PATH="$PROJECT_PATH/frontend"

if [ -d "$FRONTEND_PATH" ]; then
    cd "$FRONTEND_PATH"
    
    echo "   🧹 Limpando cache..."
    rm -rf dist build .vite node_modules/.vite node_modules/.cache
    
    echo "   📦 Executando npm run build..."
    if npm run build; then
        echo -e "   ${GREEN}✅ Build gerado com sucesso!${NC}"
    else
        echo -e "   ${RED}❌ Erro ao gerar build${NC}"
        echo "   Execute manualmente: cd $FRONTEND_PATH && npm run build"
    fi
    
    cd - > /dev/null
else
    echo -e "${YELLOW}⚠️  Pasta frontend não encontrada: $FRONTEND_PATH${NC}"
fi

# 4. Aplicar no servidor (se especificado)
if [ ! -z "$SERVER_PATH" ]; then
    echo ""
    echo -e "${BLUE}🌐 Aplicando no servidor...${NC}"
    
    if [ -d "$SERVER_PATH" ]; then
        echo "   💾 Backup do servidor atual..."
        if [ -d "${SERVER_PATH}_backup" ]; then
            rm -rf "${SERVER_PATH}_backup_old"
            mv "${SERVER_PATH}_backup" "${SERVER_PATH}_backup_old"
        fi
        cp -r "$SERVER_PATH" "${SERVER_PATH}_backup"
        
        echo "   📋 Copiando arquivos para servidor..."
        cp -r servidor_web/* "$SERVER_PATH/"
        
        echo -e "   ${GREEN}✅ Arquivos aplicados no servidor!${NC}"
    else
        echo -e "${YELLOW}⚠️  Caminho do servidor não encontrado: $SERVER_PATH${NC}"
    fi
fi

# 5. Instruções finais
echo ""
echo -e "${GREEN}🎉 APLICAÇÃO CONCLUÍDA!${NC}"
echo "========================"
echo ""
echo "📋 Próximos passos:"
echo ""

if [ -d "$FRONTEND_PATH" ]; then
    echo "🔧 Desenvolvimento local:"
    echo "   cd $FRONTEND_PATH"
    echo "   npm run dev"
    echo "   Acesse: http://localhost:3000/dashboard"
    echo ""
fi

if [ ! -z "$SERVER_PATH" ]; then
    echo "🌐 Servidor de produção:"
    echo "   Acesse: https://www.primefiit.com.br/dashboard"
    echo "   Teste admin: https://www.primefiit.com.br/dashboard/admin"
    echo ""
    echo "🔍 Verificação:"
    echo "   ./verificar_correcao.sh"
    echo ""
fi

echo "🧹 Limpeza de cache:"
echo "   Navegador: Ctrl+Shift+Delete (limpar tudo)"
echo "   Servidor: sudo service apache2 reload"
echo ""

echo "✅ Verificar se funciona:"
echo "   - Dashboard carrega instantaneamente"
echo "   - Admin funciona sem NetworkError"
echo "   - Console sem erros de token"
echo ""

echo -e "${GREEN}🚀 PrimeFit corrigido e pronto para uso!${NC}"

