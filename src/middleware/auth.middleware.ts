import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../types/index.js';

// Middleware para autenticação JWT (placeholder)
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Token de autorização necessário' });
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    // TODO: Implementar verificação real do JWT
    // Por enquanto, vamos simular um payload válido
    const mockPayload: JWTPayload = {
      clinicId: 'clinic-1',
      userId: 'user-123',
      role: 'staff',
    };

    // Adiciona os dados do JWT à request para uso posterior
    (request as any).user = mockPayload;
  } catch (error) {
    return reply.code(401).send({ error: 'Token inválido' });
  }
}

// Helper para extrair clinic ID do JWT
export function getClinicIdFromRequest(request: FastifyRequest): string {
  const user = (request as any).user as JWTPayload;
  return user?.clinicId || '';
}

// Helper para verificar se usuário tem permissão
export function hasPermission(request: FastifyRequest, requiredRole?: string): boolean {
  const user = (request as any).user as JWTPayload;

  if (!user) return false;

  if (!requiredRole) return true;

  // Implementar lógica de permissões conforme necessário
  return user.role === requiredRole || user.role === 'admin';
}
