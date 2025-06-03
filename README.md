# PrimeFit - Sistema de Consultoria Fitness

Sistema completo de consultoria fitness com backend em Python/FastAPI e frontend em React, integrado com Supabase.

## 🚀 Funcionalidades

### Para Clientes
- ✅ **Dashboard Funcional** - Visão geral com estatísticas reais
- ✅ **Meus Treinos** - Visualização e download de PDFs de treino
- ✅ **Meu Progresso** - Registro e acompanhamento com gráficos
- ✅ **Avaliações** - Sistema completo de avaliações físicas
- ✅ **Mensagens** - Comunicação com a equipe
- ✅ **Perfil** - Gerenciamento de dados pessoais

### Para Administradores
- ✅ **Painel Administrativo** - Estatísticas e análises completas
- ✅ **Gerenciamento de Usuários** - Visualização e edição de perfis
- ✅ **Atividades Recentes** - Monitoramento em tempo real
- ✅ **Analytics** - Gráficos de crescimento e distribuição

### Recursos Técnicos
- ✅ **Autenticação Completa** - Login, registro e recuperação de senha
- ✅ **Upload de Arquivos** - Sistema de storage para PDFs e imagens
- ✅ **Gráficos Interativos** - Visualizações com Chart.js
- ✅ **Responsivo** - Interface adaptada para mobile e desktop
- ✅ **API RESTful** - Backend completo com documentação automática

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **Supabase** - Banco de dados PostgreSQL e autenticação
- **Pydantic** - Validação de dados
- **SQLAlchemy** - ORM para banco de dados
- **Python-JOSE** - Autenticação JWT

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **React Router** - Roteamento SPA
- **Chart.js** - Gráficos interativos
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Build tool moderna

## 📋 Pré-requisitos

- Python 3.11+
- Node.js 18+
- Conta no Supabase
- Git

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/Felicordeirofcf/primefit.git
cd primefit
```

### 2. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL fornecido em `setup_supabase_primefit.sql`
3. Configure os buckets de storage conforme o guia
4. Anote a URL do projeto e as chaves de API

### 3. Configuração do Backend

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações do Supabase
```

### 4. Configuração do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## 🚀 Execução

### Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

## 📊 Configuração do Banco de Dados

### Tabelas Principais
- **profiles** - Perfis de usuário
- **treinos_enviados** - Treinos em PDF
- **progresso** - Registros de evolução
- **avaliacoes** - Avaliações físicas
- **mensagens** - Sistema de mensagens
- **planos** - Planos de assinatura
- **assinaturas** - Controle de assinaturas
- **audit_log** - Log de auditoria

### Buckets de Storage
- **treinos** - Arquivos PDF de treino
- **fotos-progresso** - Fotos de evolução
- **avatars** - Fotos de perfil

## 🔐 Autenticação

O sistema utiliza autenticação JWT integrada com Supabase Auth:

- **Registro** - Criação de conta com email/senha
- **Login** - Autenticação com JWT
- **Recuperação** - Reset de senha por email
- **Perfis** - Completar dados após registro

## 📱 Planos de Assinatura

### Série Única - R$ 80,00
- Treino personalizado em PDF
- Suporte básico por mensagens

### Consultoria Completa - R$ 150,00
- Treino personalizado em PDF
- Acompanhamento de progresso
- Avaliações físicas
- Suporte completo por mensagens

## 🎯 Endpoints da API

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout

### Usuários
- `GET /profiles/me` - Perfil do usuário
- `PUT /profiles/me` - Atualizar perfil

### Treinos
- `GET /trainings/` - Listar treinos
- `POST /trainings/` - Criar treino
- `GET /trainings/{id}` - Detalhes do treino

### Progresso
- `GET /progress/` - Listar progresso
- `POST /progress/` - Registrar progresso
- `GET /progress/stats/summary` - Estatísticas

### Dashboard
- `GET /dashboard/user-summary` - Resumo do usuário
- `GET /dashboard/recent-activity` - Atividades recentes
- `GET /dashboard/quick-stats` - Estatísticas rápidas

### Admin (Apenas Administradores)
- `GET /admin/stats/overview` - Visão geral
- `GET /admin/users` - Listar usuários
- `GET /admin/analytics/users` - Analytics

## 🔧 Configurações Avançadas

### Variáveis de Ambiente - Backend
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
JWT_SECRET_KEY=sua-chave-jwt-segura
```

### Variáveis de Ambiente - Frontend
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 📚 Documentação da API

Após iniciar o backend, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Solução de Problemas

### Erro de CORS
Verifique se a URL do frontend está configurada no CORS do backend.

### Erro de Autenticação
Confirme se as chaves do Supabase estão corretas no arquivo .env.

### Erro de Banco de Dados
Execute o script SQL completo no Supabase e verifique as permissões RLS.

### Erro de Upload
Verifique se os buckets foram criados e configurados corretamente.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto:
- Email: suporte@primefit.com.br
- WhatsApp: (11) 99999-9999

## 🎉 Agradecimentos

- Equipe Supabase pela excelente plataforma
- Comunidade React e FastAPI
- Todos os contribuidores do projeto

---

**PrimeFit** - Transformando vidas através do fitness 💪

