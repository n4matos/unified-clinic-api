import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';

// Schemas for Medical Guide (Guia Médico)
const MedicalGuideQuery = Type.Object({
  networkOption: Type.String(),
});
type MedicalGuideQueryType = Static<typeof MedicalGuideQuery>;

const MedicalGuideResponse = Type.Object({
  name: Type.String(),
  specialty: Type.String(),
  address: Type.String(),
  phone: Type.String(),
});
type MedicalGuideResponseType = Static<typeof MedicalGuideResponse>;

export default fp(async (app: FastifyInstance) => {
  const professionalService = app.professionalService;

  // Endpoint: Medical Guide (Guia Médico)
  app.get<{ Querystring: MedicalGuideQueryType; Reply: MedicalGuideResponseType[] }>(
    '/guide/medical',
    {
      preHandler: [app.authenticate],
      schema: {
        querystring: MedicalGuideQuery,
        response: {
          200: Type.Array(MedicalGuideResponse),
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { networkOption } = request.query;
      const professionals = await professionalService.getMedicalInvoice(tenantId, networkOption);
      return reply.send(professionals);
    }
  );
});
