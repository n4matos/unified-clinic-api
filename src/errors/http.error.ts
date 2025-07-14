export class HttpError extends Error {
  statusCode: number;
  errorName: string;

  constructor(statusCode: number, message: string, errorName?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorName =
      errorName ||
      (statusCode === 400
        ? 'Bad Request'
        : statusCode === 401
          ? 'Unauthorized'
          : statusCode === 403
            ? 'Forbidden'
            : statusCode === 404
              ? 'Not Found'
              : statusCode === 409
                ? 'Conflict'
                : 'Internal Server Error');
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
