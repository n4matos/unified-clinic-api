export interface DatabaseError extends Error {
  code: string;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as DatabaseError).code === 'string'
  );
}
