# Unified Clinic API

API em Fastify para unificar o acesso de múltiplas clínicas. Cada clínica possui sua própria base de dados (PostgreSQL ou MySQL), e a seleção do banco é feita através do cabeçalho `clinicId`.

## Arquitetura

O projeto utiliza uma abordagem **multi-pool monolítica**: todas as conexões de banco de dados são gerenciadas dentro de um único container da API, mas cada clínica tem seu próprio pool de conexões dedicado. Isso simplifica o deploy e permite escalar a aplicação replicando o container da API conforme necessário.

### Tecnologias Principais

*   **Fastify**: Framework web rápido e de baixo overhead para Node.js.
*   **TypeScript**: Linguagem de programação que adiciona tipagem estática ao JavaScript, melhorando a manutenibilidade e a detecção de erros.
*   **Knex.js**: Um construtor de queries SQL flexível e programático que suporta múltiplos bancos de dados (PostgreSQL, MySQL, etc.), abstraindo as diferenças de sintaxe SQL e prevenindo SQL Injection.
*   **Zod**: Biblioteca de validação de schemas para garantir que os dados de entrada da API estejam corretos e tipados.
*   **Docker Compose**: Ferramenta para definir e executar aplicações Docker multi-container, facilitando o setup do ambiente de desenvolvimento local com PostgreSQL, MySQL e a API.

### Estrutura do Projeto

*   `src/plugins/multiTenancy.ts`: Plugin Fastify responsável por inicializar e gerenciar os pools de conexão Knex.js para cada clínica ativa, disponibilizando o pool correto via `request.db` para cada requisição.
*   `src/routes/`: Contém as definições de rotas da API. Os handlers das rotas obtêm o pool de conexão através de `request.db` e o passam para a camada de serviço.
*   `src/services/`: Camada de lógica de negócios, que orquestra as operações e interage com os repositórios.
*   `src/repositories/`: Camada de acesso a dados, que utiliza Knex.js para construir e executar queries no banco de dados.
*   `src/schemas/`: Contém os schemas de validação de entrada (Zod) para as rotas da API.
*   `src/types/`: Definições de tipos TypeScript para entidades e interfaces customizadas.
*   `docker-compose.yml`: Define os serviços Docker para PostgreSQL, MySQL e a API, incluindo configurações de rede, volumes e health checks.
*   `scripts/init.sql`: Script de inicialização para o banco de dados PostgreSQL.
*   `scripts/init-mysql.sql`: Script de inicialização para o banco de dados MySQL.

## Configuração e Inicialização

### Pré-requisitos

Certifique-se de ter o [Docker](https://docs.docker.com/get-docker/) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados em sua máquina.

### Variáveis de Ambiente

As configurações das clínicas são definidas em `src/config/tenants.config.ts`. Para o ambiente local, as conexões para `clinicId: 1` (PostgreSQL) e `clinicId: 2` (MySQL) já estão configuradas para os serviços do `docker-compose.yml`.

### Iniciando a Aplicação

1.  **Construa e inicie os containers Docker**:
    ```bash
    docker compose up --build -d
    ```
    Este comando irá:
    *   Construir a imagem Docker da API.
    *   Iniciar os containers do PostgreSQL (`db_postgres`), MySQL (`db_mysql`) e da API (`api`).
    *   Os bancos de dados serão inicializados com os schemas e dados definidos em `scripts/init.sql` e `scripts/init-mysql.sql`.
    *   A API aguardará até que os serviços de banco de dados estejam saudáveis antes de iniciar.

2.  **Verifique o status dos containers**:
    ```bash
    docker compose ps
    ```
    Você deve ver os três serviços (`api`, `db_postgres`, `db_mysql`) com status `running` e `healthy`.

## Testando a Aplicação

A API estará disponível em `http://localhost:3000`.

### Cabeçalho `clinicId`

Para direcionar as requisições para a clínica correta, você deve incluir o cabeçalho `clinicId` em todas as requisições para as rotas de negócio:

*   `clinicId: 1` (para PostgreSQL)
*   `clinicId: 2` (para MySQL)

### Exemplos de Requisições (usando `curl`)

#### Criar Paciente (Clínica 1 - PostgreSQL)

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "clinicId: 1" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@example.com",
    "phone": "11987654321",
    "birth_date": "1990-01-01"
  }'
```

#### Listar Pacientes (Clínica 1 - PostgreSQL)

```bash
curl -X GET http://localhost:3000/patients \
  -H "clinicId: 1"
```

#### Criar Paciente (Clínica 2 - MySQL)

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "clinicId: 2" \
  -d '{
    "name": "Maria Souza",
    "email": "maria.souza@example.com",
    "phone": "21998765432",
    "birth_date": "1985-05-10"
  }'
```

#### Listar Pacientes (Clínica 2 - MySQL)

```bash
curl -X GET http://localhost:3000/patients \
  -H "clinicId: 2"
```

### Testando Validação de Entrada

Tente criar um paciente com um nome vazio ou um email inválido para ver a validação em ação:

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "clinicId: 1" \
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