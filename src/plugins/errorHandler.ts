import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { HttpError } from '../errors/http.error';

async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorName = 'Internal Server Error';
    let validationErrors: any = undefined;

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

    reply.status(statusCode).send({
      statusCode,
      message,
      error: errorName,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(validationErrors && { errors: validationErrors }),
    });
  });
}

export default fp(errorHandlerPlugin);
