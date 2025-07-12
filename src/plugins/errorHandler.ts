import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { HttpError } from '../errors/http.error';

interface ValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
}

async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorName = 'Internal Server Error';
    let validationErrors: ValidationError[] | undefined = undefined;

    const isProduction = process.env.NODE_ENV === 'production';

    if (error instanceof HttpError) {
      statusCode = error.statusCode;
      message = error.message;
      errorName = reply.raw.statusCode === 404 ? 'Not Found' : 'Bad Request'; // Default for HttpError, can be refined
    } else if (error.validation) {
      statusCode = 400;
      message = 'Validation error';
      errorName = 'Bad Request';
      validationErrors = error.validation;
    } else if (error.statusCode) {
      // Fastify errors often have a statusCode
      statusCode = error.statusCode;
      message = error.message;
      errorName = error.name;
    }

    interface ErrorResponse {
      statusCode: number;
      message: string;
      error: string;
      path: string;
      timestamp: string;
      stack?: string;
      errors?: ValidationError[];
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message: isProduction ? 'Internal Server Error' : message,
      error: isProduction ? 'Internal Server Error' : errorName,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (!isProduction && error.stack) {
      errorResponse.stack = error.stack;
    }

    if (validationErrors) {
      errorResponse.errors = validationErrors;
    }

    reply.status(statusCode).send(errorResponse);
  });
}

export default fp(errorHandlerPlugin);
