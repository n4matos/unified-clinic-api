import fp from 'fastify-plugin';

export default fp(async (app) => {
  // Exemplo: app.decorate('db', yourPrismaClient)
  // Pode centralizar conexão a cada clínica aqui, usando multi-tenancy.
});
