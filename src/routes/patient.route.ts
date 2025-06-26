import { FastifyInstance } from 'fastify';

export default async function (app: FastifyInstance) {
  // GET /patients - Lista todos os pacientes
  app.get(
    '/patients',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              patients: { type: 'array' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: implementar busca de pacientes
      return reply.send({
        patients: [],
        message: 'Endpoint implementado - aguardando implementação do serviço',
      });
    },
  );

  // GET /patients/:id - Busca paciente por ID
  app.get(
    '/patients/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              patient: { type: ['object', 'null'] },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      // TODO: implementar busca por ID
      return reply.send({
        patient: null,
        message: `Buscando paciente com ID: ${id} - aguardando implementação`,
      });
    },
  );

  // POST /patients - Cria novo paciente
  app.post(
    '/patients',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string' },
            address: { type: 'string' },
          },
          required: ['name'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              patient: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: implementar criação
      return reply.code(201).send({
        patient: request.body,
        message: 'Paciente criado - aguardando implementação do serviço',
      });
    },
  );

  // PUT /patients/:id - Atualiza paciente
  app.put(
    '/patients/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string' },
            address: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      // TODO: implementar atualização
      return reply.send({
        patient: { id, data: request.body },
        message: 'Paciente atualizado - aguardando implementação',
      });
    },
  );

  // DELETE /patients/:id - Remove paciente
  app.delete(
    '/patients/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          204: {
            type: 'null',
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      // TODO: implementar exclusão
      return reply.code(204).send();
    },
  );
}
