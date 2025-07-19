import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
  MedicalGuideQuerySchema,
  MedicalGuidePaginatedResponseSchema,
  MedicalGuideQueryType,
  MedicalGuidePaginatedResponseType,
  ErrorResponse,
  ErrorResponseType,
} from '../schemas';

export default fp(async (app: FastifyInstance) => {
  const professionalService = app.professionalService;

  // Endpoint: Medical Guide (Guia Médico) with Pagination
  app.get<{
    Querystring: MedicalGuideQueryType;
    Reply: MedicalGuidePaginatedResponseType | ErrorResponseType;
  }>(
    '/medical',
    {
      preHandler: [app.authenticate],
      schema: {
        querystring: MedicalGuideQuerySchema,
        response: {
          200: MedicalGuidePaginatedResponseSchema,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const clinicId = request.tenantId!; // Vem do header X-Clinic-ID
      const { networkOption, page = 1, limit = 10 } = request.query;
      const professionals = await professionalService.getMedicalGuide(
        clinicId,
        networkOption,
        page,
        limit,
        app
      );
      return reply.send(professionals);
    }
  );
});
