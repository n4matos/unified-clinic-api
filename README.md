# Unified Clinic API

API em Fastify para unificar o acesso de até seis clínicas distintas. Cada clínica possui sua própria base de dados (Postgres ou MySQL) e a seleção do banco é feita através do cabeçalho `x-clinic-id`.

## Contexto

O projeto utiliza a abordagem **multi‑pool monolítica**: todas as conexões ficam em um único container, porém cada clínica possui um pool dedicado. Isso simplifica o deploy e permite escalar replicando o container caso seja necessário.

### Estrutura

- `src/plugins/multiTenancy.ts` – plugin responsável por criar os pools de cada clínica e disponibilizá‑los como `request.db`.
- `src/routes/` – rotas da aplicação. Os handlers obtêm o pool através de `request.db` e passam para os serviços.
- `src/services/` e `src/repositories/` – camada de negócios e acesso aos dados de forma stateless, recebendo o pool como parâmetro.

Para inicializar os pools, defina as variáveis de ambiente `DB_CLINIC1` até `DB_CLINIC6` com as strings de conexão de cada clínica. Caso alguma clínica utilize MySQL em vez de Postgres, informe o tipo em `DB_TYPE_CLINICx` (por exemplo `mysql`).

## Executando

```bash
npm install
npm run dev
```

Envie o cabeçalho `x-clinic-id` com o identificador da clínica nas requisições.
