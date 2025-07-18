import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types/auth.types';
import { HttpError } from '../errors/http.error';

export class JWTService {
  private static parseExpiresIn(expiresIn: string): number {
    // Converte formato "15m", "1h", "7d" para segundos
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 'm':
        return value * 60; // minutos
      case 'h':
        return value * 60 * 60; // horas
      case 'd':
        return value * 24 * 60 * 60; // dias
      default:
        throw new Error(`Invalid expires format: ${expiresIn}`);
    }
  }

  static generateAccessToken(clientId: string): string {
    const secret = config.jwt.secret;
    if (!secret) {
      throw new HttpError(500, 'JWT_SECRET is not configured', 'Internal Server Error');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = this.parseExpiresIn(config.jwt.accessTokenExpiresIn);

    const payload: JWTPayload = {
      sub: clientId,
      iat: now,
      exp: now + expiresInSeconds,
      type: 'access',
    };

    return jwt.sign(payload, secret);
  }

  static generateRefreshToken(clientId: string): string {
    const secret = config.jwt.secret;
    if (!secret) {
      throw new HttpError(500, 'JWT_SECRET is not configured', 'Internal Server Error');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = this.parseExpiresIn(config.jwt.refreshTokenExpiresIn);

    const payload: JWTPayload = {
      sub: clientId,
      iat: now,
      exp: now + expiresInSeconds,
      type: 'refresh',
    };

    return jwt.sign(payload, secret);
  }

  static verifyToken(token: string): JWTPayload {
    const secret = config.jwt.secret;
    if (!secret) {
      throw new HttpError(500, 'JWT_SECRET is not configured', 'Internal Server Error');
    }

    try {
      return jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpError(401, `Invalid token: ${error.message}`, 'Unauthorized');
      }
      throw new HttpError(500, 'Token verification failed', 'Internal Server Error');
    }
  }

  static getAccessTokenExpiresInSeconds(): number {
    return this.parseExpiresIn(config.jwt.accessTokenExpiresIn);
  }
}
