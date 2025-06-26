import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { PatientService } from '../services/patient.service';
import { PatientRepository } from '../repositories/patient.repository';

export default fp(async (app: FastifyInstance) => {
  const patientRepository = new PatientRepository(app.pg);
  const patientService = new PatientService(patientRepository);
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
      const patients = await patientService.getAll();
      return reply.send({
        patients,
        message: 'Pacientes listados com sucesso',
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
      const patient = await patientService.getById(id);
      return reply.send({
        patient,
        message: patient ? 'Paciente encontrado' : 'Paciente não encontrado',
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
      const body = request.body as Omit<
        import('../types/entities.types').Patient,
        'id' | 'createdAt' | 'updatedAt'
      >;
      const patient = await patientService.create(body);
      return reply.code(201).send({
        patient,
        message: 'Paciente criado com sucesso',
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
      const body = request.body as Partial<
        Omit<import('../types/entities.types').Patient, 'id' | 'createdAt' | 'updatedAt'>
      >;
      const patient = await patientService.update(id, body);
      return reply.send({
        patient,
        message: patient ? 'Paciente atualizado com sucesso' : 'Paciente não encontrado',
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
      await patientService.delete(id);
      return reply.code(204).send();
    },
  );
});
