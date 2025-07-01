import { HttpError } from '../errors/http.error';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { PatientService } from '../services/patient.service';
import { PatientRepository } from '../repositories/patient.repository';
import { patientCreateSchema, patientUpdateSchema } from '../schemas/patient.schema';
import { Patient } from '../types/patient.types';
import { zodToJsonSchema } from 'zod-to-json-schema';

const patientCreateJsonSchema = zodToJsonSchema(patientCreateSchema);
const patientUpdateJsonSchema = zodToJsonSchema(patientUpdateSchema);

export default fp(async (app: FastifyInstance) => {
  const patientRepository = new PatientRepository();
  const patientService = new PatientService(patientRepository);

  // Apply authentication middleware to all patient routes
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/patients',
    
    async (request, reply) => {
      const db = app.getDbPool(request.clinicId!);
      const patients = await patientService.getAll(db);
            return reply.send(patients);
    },
  );

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
      },
    },
    async (request, reply) => {
      const db = app.getDbPool(request.clinicId!);
      const { id } = request.params as { id: string };
      const patient = await patientService.getById(db, id);
            if (!patient) {
        throw new HttpError(404, 'Patient not found');
      }
      return reply.send(patient);
    },
  );

  app.post(
    '/patients',
    {
      schema: {
        body: patientCreateJsonSchema,
      },
    },
    async (request, reply) => {
      const db = app.getDbPool(request.clinicId!);
      const body = request.body as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
            const patient = await patientService.create(db, body);
      return reply.code(201).send(patient);
    },
  );

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
        body: patientUpdateJsonSchema,
      },
    },
    async (request, reply) => {
      const db = app.getDbPool(request.clinicId!);
      const { id } = request.params as { id: string };
      const body = request.body as Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>;
            const patient = await patientService.update(db, id, body);
      if (!patient) {
        throw new HttpError(404, 'Patient not found');
      }
      return reply.send(patient);
    },
  );

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
      },
    },
    async (request, reply) => {
      const db = app.getDbPool(request.clinicId!);
      const { id } = request.params as { id: string };
      await patientService.delete(db, id);
      return reply.code(204).send();
    },
  );
});
