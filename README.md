# Unified Clinic API

![CI](https://github.com/username/unified-clinic-api/workflows/CI%20Pipeline/badge.svg)
![Node.js](https://img.shields.io/badge/node.js-18.x%20%7C%2020.x-green)
![TypeScript](https://img.shields.io/badge/typescript-5.5.0-blue)

API em Fastify para unificar o acesso de múltiplos tenants (clínicas). Cada tenant possui sua própria base de dados (PostgreSQL, MySQL ou SQL Server), e a seleção do banco é feita através de um JWT (JSON Web Token) obtido após a autenticação com credenciais de tenant.

## Arquitetura

O projeto utiliza uma abordagem **multi-tenant com gerenciamento dinâmico**:

- **Banco Central**: PostgreSQL que armazena as configurações de todos os tenants
- **Bancos de Tenants**: Cada tenant pode ter seu próprio banco de dados (PostgreSQL, MySQL ou SQL Server)
- **Pools Dinâmicos**: As conexões são criadas dinamicamente baseadas nas configurações armazenadas no banco central
- **Cache de Conexões**: Os pools de conexão são cacheados para melhor performance

Isso permite máxima flexibilidade, permitindo que cada tenant use o tipo de banco que preferir, facilitando migrações e integrações.

### Tecnologias Principais

- **Fastify**: Framework web rápido e de baixo overhead para Node.js.
- **TypeScript**: Linguagem de programação que adiciona tipagem estática ao JavaScript, melhorando a manutenibilidade e a detecção de erros.
- **Knex.js**: Um construtor de queries SQL flexível e programático que suporta múltiplos bancos de dados (PostgreSQL, MySQL, SQL Server), abstraindo as diferenças de sintaxe SQL e prevenindo SQL Injection.
- **bcryptjs**: Biblioteca para hash de senhas e credenciais de tenants, garantindo que as informações sensíveis sejam armazenadas de forma segura.
- **jsonwebtoken**: Biblioteca para geração e verificação de JSON Web Tokens (JWTs), utilizada para autenticação e autorização baseada em tenants.
- **Docker Compose**: Ferramenta para definir e executar aplicações Docker multi-container, facilitando o setup do ambiente de desenvolvimento local com PostgreSQL, MySQL e a API.

### Estrutura do Projeto

#### Core da Aplicação

- `src/app.ts`: Configuração principal da aplicação Fastify com registro de plugins e middlewares.
- `src/server.ts`: Inicialização do servidor com configuração de graceful shutdown.
- `src/config.ts`: Configurações centrais da aplicação (porta, banco central, JWT).

#### Gerenciamento de Tenants

- `src/config/db.config.ts`: **DatabaseManager** - Singleton responsável por gerenciar conexões dinâmicas com bancos de tenants, incluindo cache de pools e configurações de banco central.
- `src/plugins/configDatabase.ts`: Plugin Fastify que gerencia a conexão com o banco central onde estão armazenadas as configurações dos tenants.
- `src/plugins/multiTenancy.ts`: Plugin Fastify que inicializa pools de conexão para todos os tenants ativos no startup.
- `src/services/tenant.service.ts`: Serviço para operações CRUD de tenants, incluindo validação de credenciais e hash de secrets.

#### Autenticação e Autorização

- `src/middleware/auth.middleware.ts`: Middleware Fastify que verifica o JWT em requisições protegidas, extrai o `tenant_id` e `client_id` do token e valida se o tenant ainda está ativo.
- `src/routes/auth.route.ts`: Rota de login que autentica tenants usando `client_id` e `client_secret`, retornando um JWT válido.

#### Rotas da API

- `src/routes/tenant.route.ts`: Rotas administrativas para gerenciar tenants (CRUD completo).
- `src/routes/health.route.ts`: Rotas de health check para monitoramento da aplicação e status dos bancos.

#### Infraestrutura

- `src/plugins/errorHandler.ts`: Plugin de tratamento centralizado de erros com formatação padronizada.
- `src/errors/http.error.ts`: Classe customizada para erros HTTP com códigos de status apropriados.
- `src/types/fastify-custom.d.ts`: Extensões de tipos TypeScript para decorações customizadas do Fastify.

#### Scripts e Configuração

- `scripts/init-clinics.sql`: Script SQL para criação da tabela `tenants` e inserção de dados de exemplo.
- `scripts/tenant-api-examples.http`: Exemplos de requisições HTTP para testar a API (compatível com REST Client do VS Code).
- `docker-compose.yml`: Configuração Docker para PostgreSQL (banco central e tenants) e MySQL (para tenants que preferem MySQL).
- `scripts/init.sql`: Script de inicialização para o banco de dados PostgreSQL das clínicas.
- `scripts/init-mysql.sql`: Script de inicialização para o banco de dados MySQL das clínicas.
- `scripts/init-users.sql`: Script de inicialização para o banco de dados de usuários da API.

## Configuração e Inicialização

### Pré-requisitos

Certifique-se de ter o [Docker](https://docs.docker.com/get-docker/) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados em sua máquina.

### Variáveis de Ambiente

- `JWT_SECRET`: Uma string secreta forte usada para assinar e verificar os JWTs. Definida no `docker-compose.yml`.
- `USERS_DATABASE_URL`: String de conexão para o banco de dados de usuários da API. Definida no `docker-compose.yml`.

### Iniciando a Aplicação

1.  **Construa e inicie os containers Docker**:

    ```bash
    docker compose up --build -d --force-recreate
    ```

    Este comando irá:
    - Construir a imagem Docker da API.
    - Iniciar os containers do PostgreSQL para usuários (`db_users`), PostgreSQL para clínicas (`db_postgres`), MySQL para clínicas (`db_mysql`) e a API (`api`).
    - Os bancos de dados serão inicializados com os schemas e dados definidos em seus respectivos scripts `init-*.sql`.
    - A API aguardará até que todos os serviços de banco de dados estejam saudáveis antes de iniciar.

2.  **Verifique o status dos containers**:
    ```bash
    docker compose ps
    ```
    Você deve ver todos os serviços (`api`, `db_users`, `db_postgres`, `db_mysql`) com status `running` e `healthy`.

## Autenticação e Teste da Aplicação

A API estará disponível em `http://localhost:3000`.

### Fluxo de Autenticação

Para acessar as rotas protegidas (como as de pacientes), você precisará de um JWT válido. O fluxo é o seguinte:

1.  **Registro de Usuário**: Crie um usuário associado a uma `clinicId` específica.
2.  **Login**: Autentique-se com o nome de usuário e senha para receber um JWT.
3.  **Requisições Protegidas**: Inclua o JWT no cabeçalho `Authorization: Bearer <token>` para acessar as rotas de negócio. O `clinicId` será extraído do JWT e usado para direcionar a requisição ao banco de dados correto.

### Exemplos de Requisições (usando `curl`)

#### Variável Global para JWT

Defina a variável `jwtToken` no seu cliente HTTP (como a extensão REST Client do VS Code) após o login.

```
@jwtToken = <COLE SEU JWT AQUI APÓS O LOGIN>
```

#### 1. Registrar Usuário (para Clínica 1)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1_clinic1",
    "password": "password",
    "clinicId": "1"
  }'
```

- **Nota**: Se você usar `docker compose up --force-recreate`, os usuários iniciais (`user1_clinic1`, `user2_clinic2`) já estarão no banco de dados de usuários devido ao `init-users.sql`. Você só precisa registrar novos usuários se quiser testar o endpoint de registro.

#### 2. Login de Usuário (para Clínica 1)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1_clinic1",
    "password": "password"
  }'
```

- **Resultado**: Copie o `token` retornado e cole-o na variável `@jwtToken` no seu cliente HTTP.

#### 3. Listar Pacientes (Clínica 1 - PostgreSQL) com JWT

```bash
curl -X GET http://localhost:3000/patients \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {{jwtToken}}"
```

- **Nota**: Certifique-se de que o `jwtToken` usado pertence a um usuário associado à `clinicId: 1`.

#### 4. Criar Paciente (Clínica 1 - PostgreSQL) com JWT

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{jwtToken}}" \
  -d '{
    "name": "João Silva JWT",
    "email": "joao.jwt@exemplo.com",
    "phone": "11777777777",
    "birth_date": "1985-07-20"
  }'
```

#### 5. Login de Usuário (para Clínica 2)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user2_clinic2",
    "password": "password"
  }'
```

- **Resultado**: Copie o `token` retornado e cole-o na variável `@jwtToken` no seu cliente HTTP.

#### 6. Listar Pacientes (Clínica 2 - MySQL) com JWT

```bash
curl -X GET http://localhost:3000/patients \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {{jwtToken}}"
```

- **Nota**: Certifique-se de que o `jwtToken` usado pertence a um usuário associado à `clinicId: 2`.

#### 7. Criar Paciente (Clínica 2 - MySQL) com JWT

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{jwtToken}}" \
  -d '{
    "name": "Maria Souza JWT",
    "email": "maria.jwt@exemplo.com",
    "phone": "21777777777",
    "birth_date": "1990-10-15"
  }'
```

#### 8. Testando Validação de Entrada (com JWT)

Tente criar um paciente com um nome vazio ou um email inválido para ver a validação em ação:

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{jwtToken}}" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "phone": "123"
  }'
```

Você deve receber uma resposta de erro `400 Bad Request` com detalhes sobre os campos inválidos.

### Health Check

Você pode verificar o status de saúde da API e dos pools de conexão das clínicas acessando:

```
http://localhost:3000/health/clinics
```

### Usando `patient.http`

O arquivo `scripts/patient.http` contém exemplos de requisições que podem ser executadas diretamente em IDEs como o VS Code (com a extensão REST Client).

## CI/CD e Qualidade de Código

### 🚀 **Pipeline de CI**

O projeto inclui um pipeline de Continuous Integration (CI) automatizado que executa:

- **Linting** com ESLint
- **Verificação de tipos** TypeScript
- **Formatação** com Prettier
- **Build** e compilação
- **Auditoria de segurança** com npm audit
- **Teste de Docker** build

### 📋 **Scripts de Desenvolvimento**

```bash
# Desenvolvimento
npm run dev              # Servidor em modo desenvolvimento
npm run build            # Compilar projeto
npm run start            # Servidor em produção

# Qualidade de código
npm run lint             # Executar ESLint
npm run lint:fix         # ESLint com correção automática
npm run type-check       # Verificar tipos TypeScript
npm run format           # Formatar código com Prettier
npm run format:check     # Verificar formatação

# Segurança e CI
npm run security:audit   # Auditoria de segurança
npm run ci:local         # Executar pipeline completo localmente
```

### 🔧 **Ferramentas de Qualidade**

- **ESLint**: Análise estática de código TypeScript
- **Prettier**: Formatação consistente de código
- **TypeScript**: Verificação de tipos em tempo de compilação
- **npm audit**: Verificação de vulnerabilidades de segurança

Para mais detalhes sobre o pipeline, consulte [CI Pipeline Documentation](./docs/ci-pipeline.md).

## Desligando a Aplicação

Para parar e remover todos os containers Docker definidos no `docker-compose.yml`:

```bash
docker compose down
```

## Fluxo de Autenticação

### 1. Configuração de Tenant

Cada tenant é configurado na tabela `tenants` do banco central com:

- `tenant_id`: Identificador único do tenant
- `client_id`: ID do cliente para autenticação
- `client_secret`: Credencial secreta (armazenada com hash bcrypt)
- Configurações do banco de dados específico do tenant

### 2. Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "client_id": "client1",
  "client_secret": "secret1"
}
```

**Resposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Uso do JWT

O JWT contém:

- `sub`: client_id do tenant
- `tenant_id`: ID do tenant
- `iat`: timestamp de criação
- `exp`: timestamp de expiração

Para rotas protegidas, inclua o token no header:

```http
Authorization: Bearer <jwt_token>
```

## Uso da API

### Gerenciamento de Tenants

#### Listar Tenants

```http
GET /tenants
```

#### Criar Tenant

```http
POST /tenants
Content-Type: application/json

{
  "tenant_id": "clinic1",
  "client_id": "client1",
  "client_secret": "secret1",
  "db_type": "pg",
  "db_host": "localhost",
  "db_port": 5432,
  "db_user": "postgres",
  "db_pass": "password",
  "db_name": "clinic1_db"
}
```

#### Atualizar Tenant

```http
PUT /tenants/:tenantId
Content-Type: application/json

{
  "db_host": "new-host.com",
  "db_port": 5433
}
```

#### Deletar Tenant

```http
DELETE /tenants/:tenantId
```

### Health Checks

#### Status Geral

```http
GET /health
```

#### Status dos Tenants

```http
GET /health/clinics
```

#### Status do Banco Central

```http
GET /health/configdb
```

## Configuração do Ambiente

### Variáveis de Ambiente

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Banco Central (onde ficam as configurações dos tenants)
CLINICS_DATABASE_URL=postgres://user:password@localhost:5432/unified_clinic_clinics
CLINICS_DB_POOL_MIN=2
CLINICS_DB_POOL_MAX=10
CLINICS_DB_TIMEOUT=60000

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Executar scripts de inicialização
docker-compose exec postgres psql -U user -d unified_clinic_clinics -f /scripts/init-clinics.sql
```

## Arquitetura de Dados

### Banco Central

- **Objetivo**: Armazenar configurações de todos os tenants
- **Tecnologia**: PostgreSQL
- **Tabela Principal**: `tenants`
- **Responsabilidades**:
  - Autenticação de tenants
  - Configurações de conexão com bancos de tenants
  - Gerenciamento de credenciais (com hash bcrypt)

### Bancos de Tenants

- **Objetivo**: Dados específicos de cada tenant
- **Tecnologias Suportadas**: PostgreSQL, MySQL, SQL Server
- **Características**:
  - Isolamento completo entre tenants
  - Flexibilidade de escolha de tecnologia por tenant
  - Conexões dinâmicas com cache

### Padrões de Acesso

1. **Inicialização**: Carregamento de todos os tenants ativos
2. **Cache**: Pools de conexão mantidos em memória
3. **Lazy Loading**: Conexões criadas sob demanda
4. **Refresh**: Atualização de pools quando configurações mudam

## Segurança

### Autenticação

- **JWT**: Tokens com expiração configurável
- **Credentials**: Hash bcrypt para client_secrets
- **Validation**: Verificação de tenant ativo a cada requisição

### Autorização

- **Tenant Isolation**: Cada tenant só acessa seus próprios dados
- **Token Validation**: Verificação de integridade e validade do JWT
- **Database Isolation**: Bancos de dados completamente separados

### Boas Práticas Implementadas

- Secrets não expostos em logs ou respostas da API
- Tratamento de erros sem vazar informações sensíveis
- Validação rigorosa de entrada
- Graceful shutdown para evitar perda de dados

## Monitoramento

### Health Checks

- `/health`: Status geral da aplicação
- `/health/clinics`: Status dos tenants e suas conexões
- `/health/configdb`: Status do banco central

### Logs

- Logs estruturados com Pino
- Tracking de requisições com IDs únicos
- Logs de erro detalhados para debugging
- Logs de inicialização de tenants

### Métricas

- Status de conexões de tenants
- Falhas de inicialização
- Tempo de resposta das requisições
- Uso de pools de conexão

## Desenvolvimento

### Estrutura de Commits

Este projeto utiliza [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com watch
npm run build        # Build para produção
npm run start        # Executar produção
npm run lint         # Verificar code style
npm run lint:fix     # Corrigir code style
npm run format       # Formatar código
npm run type-check   # Verificar tipos TypeScript
npm run ci:local     # Verificação completa (CI local)
```

### Extensões Recomendadas (VS Code)

- REST Client: Para testar APIs usando arquivos .http
- TypeScript: Suporte oficial do TypeScript
- ESLint: Linting de código
- Prettier: Formatação automática

## Roadmap

### Próximas Funcionalidades

- [ ] Implementação de business logic específica por tenant
- [ ] Sistema de audit log
- [ ] Métricas avançadas e observabilidade
- [ ] Backup automatizado por tenant
- [ ] Interface administrativa web

### Melhorias Técnicas

- [ ] Implementação de rate limiting
- [ ] Cache Redis para performance
- [ ] Health checks mais granulares
- [ ] Suporte a migrations por tenant
- [ ] Testes automatizados completos
