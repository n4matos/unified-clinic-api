-- Criação da tabela tenants (se não existir)
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) UNIQUE NOT NULL, -- ID único do tenant (ex: 'clinic1')
    client_id VARCHAR(100) NOT NULL, -- Client ID para autenticação JWT
    client_secret VARCHAR(255) NOT NULL, -- Secret para assinatura/validação JWT (considere hash para segurança)
    db_type VARCHAR(10) NOT NULL, -- Tipo do DB: 'pg' para Postgres, 'mysql' para MySQL, 'mssql' para SQL Server
    db_host VARCHAR(255) NOT NULL, -- Host/IP do DB (ex: 'localhost' ou IP via VPN)
    db_port INTEGER NOT NULL, -- Porta do DB (ex: 5432 para PG, 3306 para MySQL, 1433 para MSSQL)
    db_user VARCHAR(100) NOT NULL, -- Usuário do DB
    db_pass VARCHAR(255) NOT NULL, -- Senha do DB (considere encriptar isso no futuro)
    db_name VARCHAR(100) NOT NULL, -- Nome do banco de dados do tenant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo de insert para uma clínica com Postgres local
-- client_secret para 'secret1' hashed com bcrypt
INSERT INTO tenants (tenant_id, client_id, client_secret, db_type, db_host, db_port, db_user, db_pass, db_name)
VALUES (
    'clinic1', 
    'client1', 
    '$2b$10$8kHJLCjmZYmJzFrPqBFnYOz6tZcnE8hCn.kAz4GIgPfBgXXcVKjIu', 
    'pg', 
    'localhost', 
    5432, 
    'postgres', 
    'postgres', 
    'clinic1_db'
) ON CONFLICT (tenant_id) DO UPDATE SET 
    client_secret = EXCLUDED.client_secret,
    updated_at = CURRENT_TIMESTAMP;

-- Exemplo para outra clínica com MySQL local
-- client_secret para 'secret2' hashed com bcrypt
INSERT INTO tenants (tenant_id, client_id, client_secret, db_type, db_host, db_port, db_user, db_pass, db_name)
VALUES (
    'clinic2', 
    'client2', 
    '$2b$10$WQu.bK3O9Kkfv7OxuQnXfuDjYoPI.4rOQJz..7iS5RCrnuZafTWDO', 
    'mysql', 
    'localhost', 
    3306, 
    'root', 
    'password', 
    'clinic2_db'
) ON CONFLICT (tenant_id) DO UPDATE SET 
    client_secret = EXCLUDED.client_secret,
    updated_at = CURRENT_TIMESTAMP;

-- Exemplo para clínica com SQL Server via VPN (substitua com credenciais reais)
-- client_secret para 'secret3' hashed com bcrypt
INSERT INTO tenants (tenant_id, client_id, client_secret, db_type, db_host, db_port, db_user, db_pass, db_name)
VALUES (
    'clinic3', 
    'client3', 
    '$2b$10$7LlkJLcmZYmJzFrPqBFnYOz6tZcnE8hCn.kAz4GIgPfBgXXcVKjIu', 
    'mssql', 
    'your-sql-server-host-via-vpn', 
    1433, 
    'sqluser', 
    'sqlpass', 
    'clinic3_db'
) ON CONFLICT (tenant_id) DO UPDATE SET 
    client_secret = EXCLUDED.client_secret,
    updated_at = CURRENT_TIMESTAMP;
