# Unified Clinic API

API em Fastify para unificar o acesso de múltiplas clínicas. Cada clínica possui sua própria base de dados (PostgreSQL ou MySQL), e a seleção do banco é feita através de um JWT (JSON Web Token) obtido após a autenticação do usuário.

## Arquitetura

O projeto utiliza uma abordagem **multi-pool monolítica**: todas as conexões de banco de dados são gerenciadas dentro de um único container da API, mas cada clínica tem seu próprio pool de conexões dedicado. Isso simplifica o deploy e permite escalar a aplicação replicando o container da API conforme necessário.

### Tecnologias Principais

*   **Fastify**: Framework web rápido e de baixo overhead para Node.js.
*   **TypeScript**: Linguagem de programação que adiciona tipagem estática ao JavaScript, melhorando a manutenibilidade e a detecção de erros.
*   **Knex.js**: Um construtor de queries SQL flexível e programático que suporta múltiplos bancos de dados (PostgreSQL, MySQL, etc.), abstraindo as diferenças de sintaxe SQL e prevenindo SQL Injection.
*   **Zod**: Biblioteca de validação de schemas para garantir que os dados de entrada da API estejam corretos e tipados.
*   **bcryptjs**: Biblioteca para hash de senhas, garantindo que as credenciais dos usuários sejam armazenadas de forma segura.
*   **jsonwebtoken**: Biblioteca para geração e verificação de JSON Web Tokens (JWTs), utilizada para autenticação e autorização.
*   **Docker Compose**: Ferramenta para definir e executar aplicações Docker multi-container, facilitando o setup do ambiente de desenvolvimento local com PostgreSQL, MySQL e a API.

### Estrutura do Projeto

*   `src/plugins/multiTenancy.ts`: Plugin Fastify responsável por inicializar e gerenciar os pools de conexão Knex.js para cada clínica ativa.
*   `src/middleware/auth.middleware.ts`: Middleware Fastify que verifica o JWT em requisições protegidas, extrai o `clinicId` do token e o disponibiliza em `request.clinicId`.
*   `src/routes/auth.route.ts`: Contém as rotas para registro (`/auth/register`) e login (`/auth/login`) de usuários, responsáveis por emitir JWTs.
*   `src/routes/`: Contém as definições de rotas da API. Os handlers das rotas obtêm o pool de conexão através de `app.getDbPool(request.clinicId!)` e o passam para a camada de serviço.
*   `src/services/`: Camada de lógica de negócios, que orquestra as operações e interage com os repositórios.
*   `src/repositories/`: Camada de acesso a dados, que utiliza Knex.js para construir e executar queries no banco de dados.
*   `src/repositories/user.repository.ts`: Repositório específico para interagir com o banco de dados de usuários da API.
*   `src/services/user.service.ts`: Serviço para lógica de negócios relacionada a usuários, incluindo hash de senhas e validação.
*   `src/schemas/`: Contém os schemas de validação de entrada (Zod) para as rotas da API.
*   `src/types/`: Definições de tipos TypeScript para entidades e interfaces customizadas.
*   `src/types/user.types.ts`: Definições de tipos para a entidade de usuário da API.
*   `docker-compose.yml`: Define os serviços Docker para PostgreSQL (para clínicas e usuários), MySQL (para clínicas) e a API, incluindo configurações de rede, volumes e health checks.
*   `scripts/init.sql`: Script de inicialização para o banco de dados PostgreSQL das clínicas.
*   `scripts/init-mysql.sql`: Script de inicialização para o banco de dados MySQL das clínicas.
*   `scripts/init-users.sql`: Script de inicialização para o banco de dados de usuários da API.

## Configuração e Inicialização

### Pré-requisitos

Certifique-se de ter o [Docker](https://docs.docker.com/get-docker/) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados em sua máquina.

### Variáveis de Ambiente

*   `JWT_SECRET`: Uma string secreta forte usada para assinar e verificar os JWTs. Definida no `docker-compose.yml`.
*   `USERS_DATABASE_URL`: String de conexão para o banco de dados de usuários da API. Definida no `docker-compose.yml`.

### Iniciando a Aplicação

1.  **Construa e inicie os containers Docker**:
    ```bash
    docker compose up --build -d --force-recreate
    ```
    Este comando irá:
    *   Construir a imagem Docker da API.
    *   Iniciar os containers do PostgreSQL para usuários (`db_users`), PostgreSQL para clínicas (`db_postgres`), MySQL para clínicas (`db_mysql`) e a API (`api`).
    *   Os bancos de dados serão inicializados com os schemas e dados definidos em seus respectivos scripts `init-*.sql`.
    *   A API aguardará até que todos os serviços de banco de dados estejam saudáveis antes de iniciar.

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
*   **Nota**: Se você usar `docker compose up --force-recreate`, os usuários iniciais (`user1_clinic1`, `user2_clinic2`) já estarão no banco de dados de usuários devido ao `init-users.sql`. Você só precisa registrar novos usuários se quiser testar o endpoint de registro.

#### 2. Login de Usuário (para Clínica 1)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1_clinic1",
    "password": "password"
  }'
```
*   **Resultado**: Copie o `token` retornado e cole-o na variável `@jwtToken` no seu cliente HTTP.

#### 3. Listar Pacientes (Clínica 1 - PostgreSQL) com JWT

```bash
curl -X GET http://localhost:3000/patients \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {{jwtToken}}"
```
*   **Nota**: Certifique-se de que o `jwtToken` usado pertence a um usuário associado à `clinicId: 1`.

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
*   **Resultado**: Copie o `token` retornado e cole-o na variável `@jwtToken` no seu cliente HTTP.

#### 6. Listar Pacientes (Clínica 2 - MySQL) com JWT

```bash
curl -X GET http://localhost:3000/patients \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {{jwtToken}}"
```
*   **Nota**: Certifique-se de que o `jwtToken` usado pertence a um usuário associado à `clinicId: 2`.

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

## Desligando a Aplicação

Para parar e remover todos os containers Docker definidos no `docker-compose.yml`:

```bash
docker compose down
```