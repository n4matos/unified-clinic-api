# Copilot Instructions - Unified Clinic API

## 🎯 **Visão Geral da Aplicação**

Esta é uma **API Multi-Tenant** desenvolvida em **Fastify + TypeScript** que oferece diferentes serviços para clínicas médicas. Cada tenant possui sua própria configuração de banco de dados (PostgreSQL, MySQL ou SQL Server) e autenticação via JWT.

### **Arquitetura Principal**

- **Framework**: Fastify com TypeScript
- **Padrão Arquitetural**: Clean Architecture (Routes → Services → Agents → Repositories)
- **Multi-Tenancy**: Lazy Loading com pools de conexão dinâmicos e **lógica de negócio customizável por tenant via Agentes**.
- **Autenticação**: JWT com tenant-based authentication
- **Validação**: TypeBox schemas com separação de responsabilidades
- **Logging**: Estruturado com contexto de tenant
- **Banco de Dados**: Knex.js com suporte a PostgreSQL, MySQL e SQL Server

---

## 🧩 **Padrão de Agentes (Strategy Pattern)**

Para permitir a customização da lógica de negócio por tenant de forma isolada e extensível, a arquitetura incorpora o **Padrão de Agentes**, que implementa o Strategy Pattern.

### **Conceito**

Em vez de um único `Service` conter lógica condicional (`if/else` ou `switch`) para diferentes tenants, ele delega a execução para um **Agente** específico. Cada Agente encapsula a lógica de negócio para um domínio (ex: `Patient`, `Guide`) e pode ter implementações distintas para diferentes tenants.

### **Benefícios**

- **Isolamento Real:** Lógicas de negócio complexas e específicas de um tenant são encapsuladas em seus próprios módulos (Agentes), sem impactar o código comum.
- **Extensibilidade Simplificada:** Adicionar uma nova variação de lógica para um novo tenant se resume a criar um novo Agente, sem alterar o `Service` existente.
- **Redução de Complexidade Ciclomática:** Elimina a necessidade de blocos `if/else` ou `switch` nos serviços para tratar regras de negócio por tenant.
- **Manutenção Focada:** As regras de um tenant podem ser modificadas de forma segura, com menor risco de efeitos colaterais em outros tenants.
- **Flexibilidade de Implementação:** Um Agente pode interagir com diferentes fontes de dados (bancos de dados com schemas distintos, APIs externas, etc.) sem que o `Service` precise saber dos detalhes.

### **Estrutura de Pastas**

```
src/
├── agents/                   # Implementações de Agentes e Fábricas
│   ├── GuideAgentFactory.ts  # Fábrica para Agentes de Guia
│   ├── PatientAgentFactory.ts# Fábrica para Agentes de Paciente
│   │
│   ├── guide/                # Agentes específicos para o domínio de Guia
│   │   ├── GuideAgent.ts     # Interface comum para Agentes de Guia
│   │   └── implementations/  # Implementações concretas de Agentes de Guia
│   │       ├── DefaultGuideAgent.ts   # Implementação padrão
│   │       └── TenantACustomGuideAgent.ts # Exemplo de implementação customizada
│   │
│   └── patient/              # Agentes específicos para o domínio de Paciente
│       ├── PatientAgent.ts   # Interface comum para Agentes de Paciente
│       └── implementations/  # Implementações concretas de Agentes de Paciente
│           ├── DefaultPatientAgent.ts # Implementação padrão
│           └── TenantBCustomPatientAgent.ts # Exemplo de implementação customizada
```

### **Responsabilidades das Camadas com Agentes**

- **Routes:** Lidam com o protocolo HTTP, validação de sintaxe e formatação de resposta.
- **Services:** Orquestram casos de uso completos, coordenando chamadas a múltiplos Agentes, gerenciando transações e aplicando lógica transversal (logging, auditoria).
- **Agents:** Implementam a lógica de negócio específica para um domínio e um tenant. São o "como" a tarefa é executada.
- **Repositories:** Abstraem o acesso a dados, mapeando objetos de domínio para o formato do banco de dados.

---

---

## 🏗️ **Estrutura de Pastas e Responsabilidades**

```
src/
├── app.ts                    # Factory da aplicação Fastify
├── server.ts                 # Ponto de entrada com graceful shutdown
├── config/                   # Configurações externalizadas
│   ├── app.config.ts         # Configuração da aplicação
│   └── db.config.ts          # DatabaseManager (Singleton)
├── plugins/                  # Plugins Fastify
│   ├── registry.ts           # Registro organizado de plugins
│   ├── configDatabase.ts     # Banco central de configurações
│   ├── multiTenancy.ts       # Gerenciamento de tenants
│   ├── appServices.ts        # Injeção de dependências
│   └── errorHandler.ts       # Tratamento centralizado de erros
├── middleware/               # Middleware customizados
│   └── auth.middleware.ts    # Autenticação JWT
├── routes/                   # Rotas da API
│   ├── auth.route.ts         # Autenticação
│   ├── health.route.ts       # Health checks
│   ├── tenant.route.ts       # Gerenciamento de tenants
│   ├── patient.route.ts      # Endpoints de pacientes
│   └── guide.route.ts        # Guia médico
├── services/                 # Lógica de negócio
│   ├── logger.service.ts     # Logging estruturado
│   ├── tenant.service.ts     # Operações de tenant
│   ├── patient.service.ts    # Lógica de pacientes
│   └── professional.service.ts
├── agents/                   # Implementações de Agentes e Fábricas
│   ├── GuideAgentFactory.ts
│   ├── PatientAgentFactory.ts
│   │
│   ├── guide/                # Agentes específicos para o domínio de Guia
│   │   ├── GuideAgent.ts
│   │   └── implementations/
│   │       ├── DefaultGuideAgent.ts
│   │       └── TenantACustomGuideAgent.ts
│   │
│   └── patient/              # Agentes específicos para o domínio de Paciente
│       ├── PatientAgent.ts
│       └── implementations/
│           ├── DefaultPatientAgent.ts
│           └── TenantBCustomPatientAgent.ts
├── repositories/             # Acesso a dados
│   ├── patient.repository.ts # Queries de pacientes
│   └── professional.repository.ts
├── schemas/                  # Validação com TypeBox
│   ├── index.ts              # Barrel exports
│   ├── common.schemas.ts     # Schemas reutilizáveis
│   └── patient.schemas.ts    # Schemas específicos
├── types/                    # Definições de tipos
│   ├── fastify.d.ts          # Extensões do Fastify
│   ├── patient.types.ts      # Tipos de domínio
│   └── index.ts              # Exports centralizados
├── errors/                   # Tratamento de erros
│   └── http.error.ts         # HttpError customizado
└── hooks/                    # Hooks Fastify
    └── registry.ts           # Registro de hooks
```

---

## 📋 **Padrões Obrigatórios**

### **1. Estrutura de Rotas**

```typescript
// SEMPRE use este padrão para rotas
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
  // Schemas
  RequestSchema,
  ResponseSchema,
  ErrorResponse,
  // Types
  RequestType,
  ResponseType,
  ErrorResponseType,
} from '../schemas';

export default fp(async (app: FastifyInstance) => {
  const serviceInstance = app.serviceName;

  app.post<{
    Body: RequestType;
    Reply: ResponseType | ErrorResponseType;
  }>(
    '/endpoint-path',
    {
      preHandler: [app.authenticate], // Para rotas protegidas
      schema: {
        body: RequestSchema,
        response: {
          200: ResponseSchema,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Sempre extrair do JWT
      const result = await serviceInstance.methodName(tenantId, request.body);
      return reply.send(result);
    }
  );
});
```

### **2. Estrutura de Services**

```typescript
// SEMPRE implemente com logging e validação
import { LoggerService } from './logger.service';
import { RepositoryClass } from '../repositories/repository.class';

export class ServiceClass {
  private repository: RepositoryClass;
  private logger?: LoggerService;

  constructor(repository: RepositoryClass, logger?: LoggerService) {
    this.repository = repository;
    this.logger = logger;
  }

  async methodName(tenantId: string, params: any): Promise<ReturnType> {
    // Log da operação
    this.logger?.info(`[${tenantId}] Starting operation`, {
      tenantId,
      operation: 'methodName',
      params: maskSensitiveData(params),
    });

    try {
      // Validação de business rules
      if (!params.required) {
        throw new Error('Required parameter is missing');
      }

      // Chama repository
      const result = await this.repository.methodName(tenantId, params);

      // Log de sucesso
      this.logger?.info(`[${tenantId}] Operation completed successfully`, {
        tenantId,
        operation: 'methodName',
      });

      return result;
    } catch (error) {
      // Log de erro
      this.logger?.error(`[${tenantId}] Operation failed`, error as Error, {
        tenantId,
        operation: 'methodName',
      });
      throw error;
    }
  }
}
```

### **3. Estrutura de Repositories**

```typescript
// SEMPRE use Knex.js para queries e inclua tenant context
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { DomainType } from '../types/domain.types';

export class RepositoryClass {
  async methodName(tenantId: string, params: any, app?: FastifyInstance): Promise<DomainType> {
    if (!app) {
      throw new Error('FastifyInstance is required for database access');
    }

    // Obter pool de conexão do tenant
    const knex = await app.getDbPool(tenantId);

    // Implementar query com Knex.js
    const result = await knex
      .select('*')
      .from('table_name')
      .where('condition', params.value)
      .first();

    if (!result) {
      throw new Error('Resource not found');
    }

    return this.mapToType(result);
  }

  private mapToType(dbResult: any): DomainType {
    // Mapeamento de dados do banco para tipos de domínio
    return {
      // ... mapeamento
    };
  }
}
```

### **4. Schemas com TypeBox**

```typescript
// SEMPRE organize schemas por domínio
import { Type, Static } from '@sinclair/typebox';
import { CommonSchema } from './common.schemas';

export const RequestSchema = Type.Object(
  {
    field1: Type.String(),
    field2: Type.Optional(Type.String()),
    nested: CommonSchema,
  },
  {
    $id: 'RequestSchema',
    title: 'Request Schema',
    description: 'Description of the schema purpose',
  }
);

export const ResponseSchema = Type.Object(
  {
    data: Type.Array(Type.String()),
    metadata: Type.Object({
      count: Type.Number(),
    }),
  },
  {
    $id: 'ResponseSchema',
    title: 'Response Schema',
    description: 'Description of the response',
  }
);

// SEMPRE exporte os tipos
export type RequestType = Static<typeof RequestSchema>;
export type ResponseType = Static<typeof ResponseSchema>;
```

### **5. Logging Estruturado**

```typescript
// SEMPRE use o LoggerService com contexto de tenant
import { LoggerService } from '../services/logger.service';

// Em Services
this.logger?.info('Operation description', {
  tenantId,
  operation: 'operationName',
  params: maskSensitiveData(params),
});

// Para erros
this.logger?.error('Error description', error as Error, {
  tenantId,
  operation: 'operationName',
});

// Para auditoria
this.logger?.audit('Action performed', {
  tenantId,
  action: 'actionName',
  resource: 'resourceName',
  userId: 'userContext',
});
```

---

## 🔧 **Configurações e Dependências**

### **Plugin Registration (PluginRegistry)**

```typescript
// SEMPRE registre na ordem correta
static async registerInfrastructurePlugins(app: FastifyInstance): Promise<void> {
  // 1. Plugins comuns
  await app.register(helmet);
  await app.register(errorHandler);
  await app.register(sensible);

  // 2. Banco de configurações
  await app.register(configDatabase);

  // 3. Multi-tenancy
  await app.register(multiTenancy);

  // 4. Application Services
  await app.register(appServices);
}
```

### **Environment Variables**

```typescript
// SEMPRE valide configurações críticas
if (config.environment === 'production') {
  if (!config.jwt.secret || config.jwt.secret === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
}
```

---

## 🚀 **Implementação de Novas Funcionalidades**

### **Checklist para Novos Endpoints**

1. **Criar/Atualizar Types**
   - Definir tipos no arquivo `src/types/domain.types.ts`
   - Exportar no `src/types/index.ts`

2. **Criar Schemas**
   - Schemas específicos em `src/schemas/feature.schemas.ts`
   - Schemas reutilizáveis em `src/schemas/common.schemas.ts`
   - Atualizar `src/schemas/index.ts`

3. **Implementar Repository**
   - Método com tenant context
   - Queries com Knex.js
   - Mapeamento de dados

4. **Implementar Service**
   - Lógica de negócio
   - Validações
   - Logging estruturado

5. **Criar Route**
   - Schemas de validação
   - Autenticação (se necessário)
   - Error handling

6. **Registrar no Plugin Registry**
   - Adicionar service no `appServices.ts`
   - Registrar route no `registry.ts`

7. **Atualizar Fastify Types**
   - Adicionar decorators no `src/types/fastify.d.ts`

### **Exemplo Completo: Nova Funcionalidade "Exams"**

```typescript
// 1. src/types/exam.types.ts
export interface Exam {
  id: string;
  patientId: string;
  type: string;
  result: string;
  date: string;
}

// 2. src/schemas/exam.schemas.ts
export const ExamRequestSchema = Type.Object({
  patientId: Type.String(),
  type: Type.String(),
});

export const ExamResponseSchema = Type.Object({
  id: Type.String(),
  patientId: Type.String(),
  type: Type.String(),
  result: Type.String(),
  date: Type.String({ format: 'date-time' }),
});

export type ExamRequestType = Static<typeof ExamRequestSchema>;
export type ExamResponseType = Static<typeof ExamResponseSchema>;

// 3. src/repositories/exam.repository.ts
export class ExamRepository {
  async getExamsByPatient(
    tenantId: string,
    patientId: string,
    app?: FastifyInstance
  ): Promise<Exam[]> {
    if (!app) {
      throw new Error('FastifyInstance is required for database access');
    }

    const knex = await app.getDbPool(tenantId);
    const results = await knex.select('*').from('exams').where('patient_id', patientId);

    return results.map(this.mapToExam);
  }

  private mapToExam(dbResult: any): Exam {
    return {
      id: dbResult.id,
      patientId: dbResult.patient_id,
      type: dbResult.exam_type,
      result: dbResult.result,
      date: dbResult.created_at.toISOString(),
    };
  }
}

// 4. src/services/exam.service.ts
export class ExamService {
  private examRepository: ExamRepository;
  private logger?: LoggerService;

  constructor(examRepository: ExamRepository, logger?: LoggerService) {
    this.examRepository = examRepository;
    this.logger = logger;
  }

  async getPatientExams(tenantId: string, patientId: string): Promise<Exam[]> {
    this.logger?.info(`[${tenantId}] Fetching patient exams`, {
      tenantId,
      operation: 'getPatientExams',
      patientId,
    });

    try {
      const exams = await this.examRepository.getExamsByPatient(tenantId, patientId);

      this.logger?.info(`[${tenantId}] Found ${exams.length} exams`, {
        tenantId,
        operation: 'getPatientExams',
        count: exams.length,
      });

      return exams;
    } catch (error) {
      this.logger?.error(`[${tenantId}] Failed to fetch exams`, error as Error, {
        tenantId,
        operation: 'getPatientExams',
      });
      throw error;
    }
  }
}

// 5. src/routes/exam.route.ts
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
  ExamRequestSchema,
  ExamResponseSchema,
  ErrorResponse,
  ExamRequestType,
  ExamResponseType,
  ErrorResponseType,
} from '../schemas';

export default fp(async (app: FastifyInstance) => {
  const examService = app.examService;

  app.get<{
    Params: { patientId: string };
    Reply: ExamResponseType[] | ErrorResponseType;
  }>(
    '/patients/:patientId/exams',
    {
      preHandler: [app.authenticate],
      schema: {
        params: Type.Object({
          patientId: Type.String(),
        }),
        response: {
          200: Type.Array(ExamResponseSchema),
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!;
      const { patientId } = request.params;

      const exams = await examService.getPatientExams(tenantId, patientId);
      return reply.send(exams);
    }
  );
});
```

---

## 🛡️ **Tratamento de Erros**

### **Padrão de Error Handling**

```typescript
// Em Services
try {
  // operação
} catch (error) {
  this.logger?.error('Error description', error as Error, { tenantId });

  // Re-throw com contexto adicional se necessário
  if (error instanceof SomeSpecificError) {
    throw new HttpError(400, 'User-friendly message');
  }

  throw error; // Deixa errorHandler tratar
}

// Em Repositories
if (!result) {
  throw new Error('Resource not found'); // Será tratado pelo errorHandler
}

// Para validações de negócio
if (!isValid) {
  throw new HttpError(400, 'Validation failed: specific reason');
}
```

---

## 🔐 **Segurança e Boas Práticas**

### **Autenticação**

- **SEMPRE** use `preHandler: [app.authenticate]` em rotas protegidas
- **SEMPRE** extraia `tenantId` do JWT: `const tenantId = request.tenantId!`
- **NUNCA** exponha o `tenantId` nas URLs

### **Validação de Dados**

- **SEMPRE** use schemas TypeBox para validação
- **SEMPRE** valide business rules nos Services
- **SEMPRE** mascare dados sensíveis nos logs

### **Database Access**

- **SEMPRE** use `app.getDbPool(tenantId)` para acessar dados
- **SEMPRE** passe `FastifyInstance` para repositories
- **SEMPRE** use Knex.js para queries (proteção contra SQL injection)

---

## 🧪 **Testes e Qualidade**

### **Comandos de Qualidade**

```bash
npm run lint          # ESLint
npm run type-check     # TypeScript compilation
npm run format:check   # Prettier
npm run build         # Build production
npm run ci:local      # Todos os checks
```

### **Estrutura de Testes**

```typescript
// Exemplo de teste para Service
describe('ExamService', () => {
  let service: ExamService;
  let mockRepository: jest.Mocked<ExamRepository>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockRepository = {
      getExamsByPatient: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as any;

    service = new ExamService(mockRepository, mockLogger);
  });

  it('should fetch patient exams successfully', async () => {
    // Arrange
    const tenantId = 'tenant1';
    const patientId = 'patient1';
    const mockExams = [{ id: '1', patientId, type: 'blood', result: 'normal', date: '2023-01-01' }];

    mockRepository.getExamsByPatient.mockResolvedValue(mockExams);

    // Act
    const result = await service.getPatientExams(tenantId, patientId);

    // Assert
    expect(result).toEqual(mockExams);
    expect(mockRepository.getExamsByPatient).toHaveBeenCalledWith(tenantId, patientId);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Fetching patient exams'),
      expect.objectContaining({ tenantId, patientId })
    );
  });
});
```

---

## 📚 **Documentação e Padrões**

### **Comentários de Código**

```typescript
/**
 * Serviço para gerenciamento de exames médicos
 * Implementa operações CRUD com suporte a multi-tenancy
 */
export class ExamService {
  /**
   * Busca exames de um paciente específico
   * @param tenantId - ID do tenant
   * @param patientId - ID do paciente
   * @returns Lista de exames do paciente
   * @throws {Error} Quando paciente não encontrado
   */
  async getPatientExams(tenantId: string, patientId: string): Promise<Exam[]> {
    // implementação
  }
}
```

### **Commits**

```bash
feat: add exam management endpoints
fix: resolve tenant connection pooling issue
docs: update API documentation
refactor: improve error handling in services
test: add unit tests for exam service
```

---

## 🎯 **Resumo dos Padrões Obrigatórios**

1. **Arquitetura**: Routes → Services → Agents → Repositories
2. **Validação**: TypeBox schemas organizados por domínio
3. **Autenticação**: JWT com tenant context
4. **Database**: Knex.js com tenant pools
5. **Logging**: Estruturado com tenant context
6. **Error Handling**: Centralizado com HttpError
7. **Types**: Organizados por domínio
8. **Plugins**: Registrados via PluginRegistry
9. **Tests**: Unit tests para Services e Repositories
10. **Security**: Validação, mascaramento e tenant isolation

---

**⚠️ IMPORTANTE**: Sempre siga estes padrões para manter a consistência e qualidade do código. Qualquer desvio deve ser justificado e documentado.
