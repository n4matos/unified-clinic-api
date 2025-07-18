# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Unified Clinic API** is a multi-tenant clinic management API built with Fastify and TypeScript. Each tenant has its own database configuration (PostgreSQL, MySQL, or SQL Server) and JWT-based authentication.

## Development Commands

```bash
# Development
npm run dev              # Start development server with watch mode
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically  
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run ci:local         # Run complete CI pipeline locally (lint + type-check + format:check + build)

# Security
npm run security:audit   # Run npm security audit
```

## Architecture

### Multi-Tenant Strategy Pattern with Agents

The application uses a **Strategy Pattern via Agents** to handle tenant-specific business logic. This architecture provides:

- **Clean Architecture**: Routes → Services → Agents → Repositories
- **Tenant Isolation**: Each tenant can have custom business logic without affecting others
- **Dynamic Database Connections**: Lazy-loaded connection pools per tenant
- **Agent Factory Pattern**: Selects appropriate agent implementation based on tenant

### Core Components

#### DatabaseManager (Singleton)
- **Location**: `src/config/db.config.ts`
- Manages dynamic connection pools for all tenants
- Central configuration database stores tenant DB configs
- Supports PostgreSQL, MySQL, and SQL Server

#### Agent Pattern
- **Guide Agents**: `src/agents/guide/` - Medical guide business logic
- **Patient Agents**: `src/agents/patient/` - Patient management logic
- **Factories**: `src/agents/GuideAgentFactory.ts`, `src/agents/PatientAgentFactory.ts`
- Each tenant can have custom agent implementations

#### Plugin Architecture
- **Registry**: `src/plugins/registry.ts` - Organized plugin registration
- **Multi-tenancy**: `src/plugins/multiTenancy.ts` - Tenant pool initialization
- **App Services**: `src/plugins/appServices.ts` - Dependency injection
- **Auth Middleware**: `src/middleware/auth.middleware.ts` - JWT validation

### Database Access Pattern

Always use this pattern for database operations:

```typescript
// In repositories, always require FastifyInstance
async methodName(tenantId: string, params: any, app?: FastifyInstance): Promise<Type> {
  if (!app) {
    throw new Error('FastifyInstance is required for database access');
  }

  const knex = await app.getDbPool(tenantId);
  return knex.select('*').from('table_name').where('condition', params.value);
}
```

### Service Layer with Agents

Services orchestrate business logic by delegating to tenant-specific agents:

```typescript
export class PatientService {
  async createPatient(tenantId: string, patientData: any): Promise<Patient> {
    // Get tenant-specific agent
    const agent = PatientAgentFactory.create(tenantId);
    
    // Delegate business logic to agent
    return await agent.createPatient(tenantId, patientData, this.app);
  }
}
```

## Key Patterns to Follow

### 1. Tenant Context
- Always extract `tenantId` from JWT: `const tenantId = request.tenantId!`
- Pass `tenantId` to all service and repository methods
- Use `app.getDbPool(tenantId)` for database access

### 2. Error Handling
- Use `HttpError` class from `src/errors/http.error.ts` for user-facing errors
- Let the centralized error handler in `src/plugins/errorHandler.ts` format responses
- Log errors with tenant context using `LoggerService`

### 3. Schema Validation
- Use TypeBox schemas in `src/schemas/` for request/response validation
- Organize schemas by domain (patient, guide, etc.)
- Always export both schema and TypeScript types

### 4. Authentication
- Protected routes use `preHandler: [app.authenticate]`
- JWT contains `tenant_id` and `client_id`
- Auth logic in `src/middleware/auth.middleware.ts`

### 5. Logging
- Use structured logging with tenant context
- LoggerService location: `src/services/logger.service.ts`
- Include operation name and tenant ID in all logs

## Environment Setup

### Required Environment Variables
- `JWT_SECRET`: Required in production
- `CLINICS_DATABASE_URL`: Central PostgreSQL database URL
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Development Setup
1. Copy `.env.example` to `.env`
2. Start databases with `docker-compose up -d`
3. Run initialization script: `scripts/init-clinics.sql`
4. Start development: `npm run dev`

## Testing

### Test Files Location
Use the standard structure for tests when implementing:
- Unit tests alongside source files or in `__tests__` directories
- Integration tests for multi-tenant scenarios
- Mock repositories for service layer testing

### Health Checks
- `/health` - Application status
- `/health/clinics` - Tenant connection status  
- `/health/configdb` - Central database status

## Multi-Tenant Business Logic

When adding new features that need tenant-specific behavior:

1. Create agent interface in `src/agents/{domain}/`
2. Implement default agent in `src/agents/{domain}/implementations/`
3. Add factory logic in `src/agents/{Domain}AgentFactory.ts`
4. Update service to use agent factory
5. For custom tenants, create specific agent implementations

## Important Files to Understand

- `src/app.ts` - Application factory and plugin registration
- `src/config/db.config.ts` - Database manager and connection pooling
- `src/plugins/registry.ts` - Plugin registration order and dependencies
- `src/middleware/auth.middleware.ts` - JWT authentication and tenant extraction
- `README.md` - Comprehensive setup and API documentation
- `.github/copilot-instructions.md` - Detailed architectural patterns and examples