import { FastifyInstance } from 'fastify';
import { RefreshToken } from '../types/auth.types';
import { HttpError } from '../errors/http.error';
import crypto from 'crypto';

export class RefreshTokenService {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  async createRefreshToken(clientId: string, tenantId: string): Promise<string> {
    const knex = this.app.getConfigDb();
    
    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Calcular data de expiração (7 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Revogar tokens existentes para este cliente
    await knex('refresh_tokens')
      .where({ client_id: clientId })
      .update({ revoked: true });

    // Inserir novo token
    await knex('refresh_tokens').insert({
      id: crypto.randomUUID(),
      client_id: clientId,
      tenant_id: tenantId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: new Date(),
      revoked: false,
    });

    return token;
  }

  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const knex = this.app.getConfigDb();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const refreshToken = await knex('refresh_tokens')
      .where({
        token_hash: tokenHash,
        revoked: false,
      })
      .where('expires_at', '>', new Date())
      .first();

    if (!refreshToken) {
      throw new HttpError(401, 'Invalid or expired refresh token', 'Unauthorized');
    }

    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const knex = this.app.getConfigDb();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await knex('refresh_tokens')
      .where({ token_hash: tokenHash })
      .update({ revoked: true });
  }

  async revokeAllRefreshTokens(clientId: string): Promise<void> {
    const knex = this.app.getConfigDb();

    await knex('refresh_tokens')
      .where({ client_id: clientId })
      .update({ revoked: true });
  }

  async cleanupExpiredTokens(): Promise<void> {
    const knex = this.app.getConfigDb();

    await knex('refresh_tokens')
      .where('expires_at', '<', new Date())
      .del();
  }
}