import { FastifyReply, FastifyRequest } from 'fastify';
import { HealthService } from '../services/health.service';

export class HealthController {
  constructor(private readonly service = new HealthService()) {}

  async check(_: FastifyRequest, reply: FastifyReply) {
    const status = await this.service.status();
    return reply.send({ status });
  }
}
