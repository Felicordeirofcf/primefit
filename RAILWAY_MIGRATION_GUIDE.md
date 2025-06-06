# Guia de Migração do Supabase para Railway PostgreSQL

Este guia detalha os passos para migrar seu banco de dados do Supabase para um serviço PostgreSQL no Railway, e adaptar seu projeto PrimeFit para funcionar com o novo banco de dados.

## Fase 1: Análise e Planejamento da Migração (Concluída)

Nesta fase, analisamos a estrutura do seu projeto e as dependências do Supabase. O plano é:
1. Exportar o esquema e os dados do seu banco de dados Supabase.
2. Criar um novo serviço PostgreSQL no Railway.
3. Importar os dados exportados para o PostgreSQL do Railway.
4. Adaptar o backend do PrimeFit para se conectar ao PostgreSQL do Railway.
5. Adaptar o frontend para garantir a comunicação com o backend atualizado.
6. Otimizar e limpar o código.
7. Realizar testes completos.
8. Empacotar os arquivos e criar um guia de deploy detalhado.

## Fase 2: Migração do Banco de Dados para PostgreSQL no Railway

### 2.1 Exportando o Banco de Dados do Supabase

Para exportar seu banco de dados Supabase, você precisará do `pg_dump`, uma ferramenta de linha de comando que vem com o PostgreSQL. Se você não o tem instalado, pode instalá-lo seguindo as instruções para o seu sistema operacional (geralmente, instalando o pacote `postgresql-client`).

**Passo 1: Obter as Credenciais de Conexão do Supabase**

1. Acesse o painel do seu projeto Supabase.
2. Navegue até `Project Settings` (Configurações do Projeto) -> `Database` (Banco de Dados).
3. Na seção `Connection String` (String de Conexão), você encontrará as credenciais necessárias. Procure pela string de conexão `URI` (Uniform Resource Identifier), que geralmente começa com `postgresql://`.

Exemplo de URI:
`postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_SUPABASE_PROJECT_ID].supabase.co:5432/postgres`

**Passo 2: Exportar o Esquema e os Dados com `pg_dump`**

Abra seu terminal ou prompt de comando e execute o seguinte comando. Substitua `[YOUR_SUPABASE_CONNECTION_URI]` pela URI que você obteve no passo anterior e `[YOUR_PASSWORD]` pela senha do seu banco de dados Supabase.

```bash
PGPASSWORD="[YOUR_PASSWORD]" pg_dump --schema-only --no-owner --no-privileges --format=p --file=supabase_schema.sql [YOUR_SUPABASE_CONNECTION_URI]
PGPASSWORD="[YOUR_PASSWORD]" pg_dump --data-only --no-owner --no-privileges --column-inserts --file=supabase_data.sql [YOUR_SUPABASE_CONNECTION_URI]
```

**Explicação dos parâmetros:**
- `PGPASSWORD="[YOUR_PASSWORD]"`: Define a senha do PostgreSQL como uma variável de ambiente para que `pg_dump` não a solicite interativamente.
- `--schema-only`: Exporta apenas a estrutura do banco de dados (tabelas, índices, etc.), sem os dados.
- `--data-only`: Exporta apenas os dados das tabelas, sem a estrutura.
- `--no-owner`: Não inclui comandos para definir o proprietário dos objetos, o que é útil ao migrar para um novo ambiente onde o usuário pode ser diferente.
- `--no-privileges` ou `-x`: Não inclui comandos para conceder privilégios (GRANT/REVOKE), pois estes podem ser específicos do ambiente Supabase.
- `--format=p`: Formato de saída plain-text (SQL).
- `--column-inserts`: Gera comandos `INSERT` com nomes de coluna explícitos, o que é mais robusto ao importar dados.
- `--file=supabase_schema.sql`: Nome do arquivo onde o esquema será salvo.
- `--file=supabase_data.sql`: Nome do arquivo onde os dados serão salvos.
- `[YOUR_SUPABASE_CONNECTION_URI]`: A string de conexão completa do seu banco de dados Supabase.

Após a execução, você terá dois arquivos: `supabase_schema.sql` (contendo a estrutura do seu banco de dados) e `supabase_data.sql` (contendo os dados).

### 2.2 Criando um Serviço PostgreSQL no Railway

1. Acesse o painel do Railway (https://railway.app/).
2. Clique em `New Project` (Novo Projeto).
3. Selecione `Provision PostgreSQL` (Provisionar PostgreSQL).
4. O Railway irá provisionar um novo banco de dados PostgreSQL para você. Anote as credenciais de conexão (Host, Port, User, Password, Database) que serão exibidas no painel do serviço. Você precisará delas para importar os dados e para configurar seu backend.

### 2.3 Importando os Dados para o PostgreSQL do Railway

Com os arquivos `supabase_schema.sql` e `supabase_data.sql` e as credenciais do Railway em mãos, você pode importar os dados.

**Passo 1: Conectar ao Banco de Dados Railway**

Você pode usar o comando `psql` (também parte da instalação do PostgreSQL) para se conectar ao seu novo banco de dados Railway. Substitua os placeholders pelas suas credenciais do Railway:

```bash
psql -h [RAILWAY_HOST] -p [RAILWAY_PORT] -U [RAILWAY_USER] -d [RAILWAY_DATABASE]
```

Você será solicitado a inserir a senha do `[RAILWAY_USER]`.

**Passo 2: Importar o Esquema**

Dentro do `psql` (ou em um novo terminal, usando o comando `psql` com redirecionamento de entrada), execute o seguinte:

```bash
psql -h [RAILWAY_HOST] -p [RAILWAY_PORT] -U [RAILWAY_USER] -d [RAILWAY_DATABASE] -f supabase_schema.sql
```

**Passo 3: Importar os Dados**

Após importar o esquema, importe os dados:

```bash
psql -h [RAILWAY_HOST] -p [RAILWAY_PORT] -U [RAILWAY_USER] -d [RAILWAY_DATABASE] -f supabase_data.sql
```

**Observações:**
- Certifique-se de que os arquivos `supabase_schema.sql` e `supabase_data.sql` estão no mesmo diretório de onde você está executando os comandos `psql`.
- Se você tiver muitos dados, a importação pode levar algum tempo.
- Verifique o terminal para quaisquer erros durante a importação.

## Fase 3: Adaptação do Backend para Railway

O backend foi adaptado para usar o PostgreSQL do Railway em vez do Supabase. As principais alterações incluem:

1. Criação de um novo cliente de banco de dados (`db_client.py`) que se conecta ao PostgreSQL do Railway.
2. Implementação de um sistema de autenticação próprio usando JWT.
3. Adaptação dos endpoints para usar o novo cliente de banco de dados.
4. Criação de um arquivo de esquema SQL para criar as tabelas necessárias no PostgreSQL do Railway.

### 3.1 Configurando as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `backend` com as seguintes variáveis:

```
# Configurações do banco de dados
DATABASE_URL=postgresql://[RAILWAY_USER]:[RAILWAY_PASSWORD]@[RAILWAY_HOST]:[RAILWAY_PORT]/[RAILWAY_DATABASE]
DB_HOST=[RAILWAY_HOST]
DB_PORT=[RAILWAY_PORT]
DB_NAME=[RAILWAY_DATABASE]
DB_USER=[RAILWAY_USER]
DB_PASSWORD=[RAILWAY_PASSWORD]

# Configurações de segurança
JWT_SECRET_KEY=seu_segredo_super_secreto_mude_em_producao
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 dias

# Configurações do servidor
PORT=8000
ENVIRONMENT=development  # development ou production

# URL do frontend
FRONTEND_URL=http://localhost:5173
```

Substitua os placeholders pelas suas credenciais do Railway.

### 3.2 Criando as Tabelas no PostgreSQL do Railway

Execute o arquivo `schema.sql` para criar as tabelas necessárias no PostgreSQL do Railway:

```bash
psql -h [RAILWAY_HOST] -p [RAILWAY_PORT] -U [RAILWAY_USER] -d [RAILWAY_DATABASE] -f schema.sql
```

### 3.3 Testando o Backend Localmente

Para testar o backend localmente, execute:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

O backend estará disponível em `http://localhost:8000`.

## Fase 4: Adaptação do Frontend para Railway

O frontend foi adaptado para se comunicar com o backend no Railway. As principais alterações incluem:

1. Atualização das URLs de API para apontar para o backend no Railway.
2. Adaptação do sistema de autenticação para usar o novo sistema de autenticação do backend.
3. Implementação de fallbacks para quando o backend não estiver disponível.

### 4.1 Configurando as Variáveis de Ambiente do Frontend

Crie um arquivo `.env` na raiz do diretório `frontend` com as seguintes variáveis:

```
VITE_API_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8000
```

Para produção, você deve atualizar essas variáveis para apontar para o backend no Railway:

```
VITE_API_URL=https://[YOUR_RAILWAY_BACKEND_URL]
VITE_WEBSOCKET_URL=wss://[YOUR_RAILWAY_BACKEND_URL]
```

### 4.2 Testando o Frontend Localmente

Para testar o frontend localmente, execute:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Fase 5: Deploy no Railway

### 5.1 Deploy do Backend

1. Crie um novo projeto no Railway.
2. Adicione um serviço PostgreSQL.
3. Adicione um serviço de aplicação e conecte-o ao seu repositório Git.
4. Configure as variáveis de ambiente necessárias (veja a seção 3.1).
5. O Railway detectará automaticamente o `Procfile` e iniciará o backend.

### 5.2 Deploy do Frontend

1. Crie um novo projeto no Railway ou adicione um novo serviço ao projeto existente.
2. Conecte-o ao seu repositório Git.
3. Configure as variáveis de ambiente necessárias (veja a seção 4.1).
4. Configure o comando de build: `npm run build`.
5. Configure o comando de start: `npx serve -s dist`.

### 5.3 Configurando o Domínio

1. No painel do Railway, vá para a seção `Settings` (Configurações) do seu serviço.
2. Na seção `Domains` (Domínios), clique em `Generate Domain` (Gerar Domínio) para obter um domínio gratuito do Railway.
3. Opcionalmente, você pode configurar um domínio personalizado seguindo as instruções do Railway.

## Conclusão

Seu projeto PrimeFit agora está configurado para usar o PostgreSQL do Railway em vez do Supabase. O backend e o frontend foram adaptados para funcionar com o novo banco de dados e estão prontos para serem implantados no Railway.

Se você encontrar algum problema durante a migração, consulte a documentação do Railway ou entre em contato com o suporte.

