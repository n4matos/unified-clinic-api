-- Criação da tabela de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  address VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Dados fictícios
INSERT INTO patients (name, email, phone, date_of_birth, address)
VALUES
  ('João Silva', 'joao@exemplo.com', '11999999999', '1990-01-01', 'Rua A, 123'),
  ('Maria Souza', 'maria@exemplo.com', '21988888888', '1985-05-10', 'Av. B, 456'),
  ('Carlos Pereira', 'carlos@exemplo.com', '31977777777', '1978-09-23', 'Travessa C, 789');
