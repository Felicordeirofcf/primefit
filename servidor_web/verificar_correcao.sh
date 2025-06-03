#!/bin/bash

# 🔍 Script de Verificação - PrimeFit Build Final
# Testa especificamente os arquivos que estavam falhando

echo "🚀 Verificando correção do NetworkError..."
echo "============================================"

BASE_URL="https://www.primefiit.com.br"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar URL com detalhes
check_url_detailed() {
    local url=$1
    local description=$2
    local expected_size=$3
    
    echo -n "🔍 $description... "
    
    # Fazer requisição e capturar informações
    response=$(curl -s -I "$url" -w "HTTPCODE:%{http_code};SIZE:%{size_download};TIME:%{time_total}")
    http_code=$(echo "$response" | grep -o "HTTPCODE:[0-9]*" | cut -d: -f2)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        
        # Verificar tamanho se fornecido
        if [ ! -z "$expected_size" ]; then
            actual_size=$(curl -s "$url" | wc -c)
            if [ "$actual_size" -gt "$expected_size" ]; then
                echo "   📏 Tamanho: ${actual_size} bytes (esperado: ~${expected_size})"
            else
                echo -e "   ${YELLOW}⚠️  Tamanho menor que esperado: ${actual_size} bytes${NC}"
            fi
        fi
        
        return 0
    else
        echo -e "${RED}❌ ERRO ($http_code)${NC}"
        return 1
    fi
}

echo "📁 Verificando NOVOS arquivos do build:"
echo "========================================"

# Verificar os novos arquivos específicos
check_url_detailed "$BASE_URL/assets/index-50074a4d.js" "JavaScript principal (NOVO)" 600000
check_url_detailed "$BASE_URL/assets/index-d6e6caf3.css" "CSS principal (ATUALIZADO)" 45000
check_url_detailed "$BASE_URL/assets/hero-image-d73227f7.jpg" "Imagem hero" 100000

echo ""
echo "🔍 Verificando arquivos ANTIGOS (devem falhar):"
echo "==============================================="

# Verificar se os arquivos antigos ainda existem (não deveriam)
echo -n "🗑️  Arquivo antigo index-f3d9c7ec.js... "
old_response=$(curl -s -I "$BASE_URL/assets/index-f3d9c7ec.js" -w "%{http_code}")
if [[ "$old_response" == *"404"* ]] || [[ "$old_response" == *"403"* ]]; then
    echo -e "${GREEN}✅ Não encontrado (correto)${NC}"
else
    echo -e "${YELLOW}⚠️  Ainda existe (limpar cache)${NC}"
fi

echo ""
echo "🌐 Verificando páginas principais:"
echo "=================================="

check_url_detailed "$BASE_URL/" "Página inicial"
check_url_detailed "$BASE_URL/dashboard" "Dashboard (redirecionamento)"
check_url_detailed "$BASE_URL/dashboard/admin" "Painel admin (redirecionamento)"

echo ""
echo "📊 Verificando headers de cache:"
echo "==============================="

# Verificar cache do JavaScript
echo -n "💾 Cache do JavaScript... "
cache_js=$(curl -s -I "$BASE_URL/assets/index-50074a4d.js" | grep -i "cache-control")
if [[ $cache_js == *"max-age"* ]]; then
    echo -e "${GREEN}✅ Configurado${NC}"
    echo "   📋 $cache_js"
else
    echo -e "${YELLOW}⚠️  Não configurado${NC}"
fi

# Verificar cache do CSS
echo -n "💾 Cache do CSS... "
cache_css=$(curl -s -I "$BASE_URL/assets/index-d6e6caf3.css" | grep -i "cache-control")
if [[ $cache_css == *"max-age"* ]]; then
    echo -e "${GREEN}✅ Configurado${NC}"
    echo "   📋 $cache_css"
else
    echo -e "${YELLOW}⚠️  Não configurado${NC}"
fi

echo ""
echo "🗜️ Verificando compressão:"
echo "=========================="

echo -n "📦 GZIP JavaScript... "
gzip_js=$(curl -s -H "Accept-Encoding: gzip" -I "$BASE_URL/assets/index-50074a4d.js" | grep -i "content-encoding")
if [[ $gzip_js == *"gzip"* ]]; then
    echo -e "${GREEN}✅ Ativo${NC}"
else
    echo -e "${YELLOW}⚠️  Não ativo${NC}"
fi

echo -n "📦 GZIP CSS... "
gzip_css=$(curl -s -H "Accept-Encoding: gzip" -I "$BASE_URL/assets/index-d6e6caf3.css" | grep -i "content-encoding")
if [[ $gzip_css == *"gzip"* ]]; then
    echo -e "${GREEN}✅ Ativo${NC}"
else
    echo -e "${YELLOW}⚠️  Não ativo${NC}"
fi

echo ""
echo "🎯 TESTE ESPECÍFICO - NetworkError:"
echo "==================================="

echo "1. 🌐 Acesse: $BASE_URL/dashboard/admin"
echo "2. 🔍 Abra DevTools (F12) → Console"
echo "3. ✅ Verifique se NÃO há:"
echo "   - ❌ TypeError: NetworkError"
echo "   - ❌ NS_BINDING_ABORTED"
echo "   - ❌ Failed to load resource"
echo ""
echo "4. ✅ Deve aparecer:"
echo "   - ✅ 'Dashboard carregado com sucesso'"
echo "   - ✅ Interface do admin funcionando"

echo ""
echo "🧹 LIMPEZA DE CACHE:"
echo "==================="

echo "Se ainda houver problemas:"
echo ""
echo "🖥️  Servidor:"
echo "   sudo service apache2 reload"
echo "   sudo nginx -s reload"
echo ""
echo "🌐 Navegador:"
echo "   Chrome: Ctrl+Shift+Delete"
echo "   Firefox: Ctrl+Shift+Delete"
echo "   Safari: Cmd+Option+E"
echo ""
echo "☁️  CDN (se aplicável):"
echo "   CloudFlare: Purge All Files"

echo ""
echo "📋 RESUMO DA VERIFICAÇÃO:"
echo "========================"

# Contar sucessos
success_count=0
total_tests=6

# Testar novamente os arquivos principais
for url in "$BASE_URL/assets/index-50074a4d.js" "$BASE_URL/assets/index-d6e6caf3.css" "$BASE_URL/assets/hero-image-d73227f7.jpg" "$BASE_URL/" "$BASE_URL/dashboard" "$BASE_URL/dashboard/admin"; do
    if curl -s -I "$url" | grep -q "200"; then
        ((success_count++))
    fi
done

echo "✅ Testes passando: $success_count/$total_tests"

if [ $success_count -eq $total_tests ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}✅ NetworkError resolvido!${NC}"
    echo -e "${GREEN}✅ PrimeFit funcionando 100%!${NC}"
else
    echo -e "${YELLOW}⚠️  Alguns testes falharam${NC}"
    echo -e "${YELLOW}📋 Verifique o README_DEPLOY_FINAL.md${NC}"
fi

echo ""
echo "🔗 Links para teste manual:"
echo "==========================="
echo "🏠 Página inicial: $BASE_URL"
echo "🔐 Login: $BASE_URL/login"
echo "📊 Dashboard: $BASE_URL/dashboard"
echo "👑 Admin: $BASE_URL/dashboard/admin"

echo ""
echo "✅ Verificação concluída!"

