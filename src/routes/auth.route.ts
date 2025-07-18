import { HttpError } from '../errors/http.error';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { TenantService } from '../services/tenant.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { JWTService } from '../services/jwt.service';
import { LoginResponse, RefreshTokenResponse } from '../types/auth.types';

export default fp(async (app: FastifyInstance) => {
  const tenantService = new TenantService();
  const refreshTokenService = new RefreshTokenService(app);

  // Login route with client_id and client_secret
  app.post('/auth/login', async (request, reply) => {
    const { client_id, client_secret } = request.body as {
      client_id?: string;
      client_secret?: string;
    };

    if (!client_id || !client_secret) {
      throw new HttpError(400, 'client_id and client_secret are required');
    }

    const tenant = await tenantService.validateTenant(client_id, client_secret);

    // Gerar access token e refresh token
    const accessToken = JWTService.generateAccessToken(client_id, tenant.tenant_id);
    const refreshToken = await refreshTokenService.createRefreshToken(client_id, tenant.tenant_id);
    
    const response: LoginResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: JWTService.getAccessTokenExpiresInSeconds(),
    };

    app.log.info(
      {
        clientId: client_id,
        tenantId: tenant.tenant_id,
        ip: request.ip,
      },
      `[${tenant.tenant_id}] User logged in successfully`
    );

    return reply.send(response);
  });

  // Refresh token route
  app.post('/auth/refresh', async (request, reply) => {
    const { refresh_token } = request.body as {
      refresh_token?: string;
    };

    if (!refresh_token) {
      throw new HttpError(400, 'refresh_token is required', 'Bad Request');
    }

    try {
      // Validar o refresh token
      const tokenData = await refreshTokenService.validateRefreshToken(refresh_token);

      // Gerar novo access token
      const newAccessToken = JWTService.generateAccessToken(
        tokenData.client_id,
        tokenData.tenant_id
      );

      const response: RefreshTokenResponse = {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: JWTService.getAccessTokenExpiresInSeconds(),
      };

      app.log.info(
        {
          clientId: tokenData.client_id,
          tenantId: tokenData.tenant_id,
          ip: request.ip,
        },
        `[${tokenData.tenant_id}] Access token refreshed successfully`
      );

      return reply.send(response);
    } catch (error) {
      app.log.warn(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          ip: request.ip,
        },
        'Refresh token validation failed'
      );
      throw error;
    }
  });

  // Logout route (revoga refresh token)
  app.post('/auth/logout', async (request, reply) => {
    const { refresh_token } = request.body as {
      refresh_token?: string;
    };

    if (!refresh_token) {
      throw new HttpError(400, 'refresh_token is required', 'Bad Request');
    }

    try {
      await refreshTokenService.revokeRefreshToken(refresh_token);
      
      app.log.info(
        {
          ip: request.ip,
        },
        'User logged out successfully'
      );

      return reply.send({ message: 'Logged out successfully' });
    } catch (error) {
      app.log.warn(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          ip: request.ip,
        },
        'Logout failed'
      );
      throw new HttpError(400, 'Invalid refresh token', 'Bad Request');
    }
  });

  // Logout de todos os dispositivos (revoga todos os refresh tokens do cliente)
  app.post('/auth/logout-all', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authorization token is required', 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    const payload = JWTService.verifyToken(token);

    await refreshTokenService.revokeAllRefreshTokens(payload.sub);
    
    app.log.info(
      {
        clientId: payload.sub,
        tenantId: payload.tenant_id,
        ip: request.ip,
      },
      `[${payload.tenant_id}] All sessions logged out successfully`
    );

    return reply.send({ message: 'All sessions logged out successfully' });
  });
});
