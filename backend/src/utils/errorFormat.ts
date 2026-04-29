export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: FieldError[];
  timestamp?: string;
}

export const createError = (code: string, message: string, fields?: FieldError[]): ApiError => {
  return {
    code,
    message,
    ...(fields && fields.length > 0 && { fields }),
    timestamp: new Date().toISOString(),
  };
};

export const validationError = (fields: FieldError[]): ApiError => {
  return createError(
    'VALIDATION_ERROR',
    'Config validation failed',
    fields
  );
};

export const notFoundError = (resource: string): ApiError => {
  return createError('NOT_FOUND', `${resource} not found`);
};

export const unauthorizedError = (message = 'Unauthorized'): ApiError => {
  return createError('UNAUTHORIZED', message);
};

export const serverError = (error: any, context?: string): ApiError => {
  const message = context ? `${context}: ${error?.message || 'Unknown error'}` : error?.message || 'Internal server error';
  return createError('SERVER_ERROR', message);
};

export const recordNotFoundError = (appId: string, entity: string): ApiError => {
  return createError('RECORD_NOT_FOUND', `Record not found for entity '${entity}' in app '${appId}'`);
};

export const entityNotFoundError = (appId: string, entity: string): ApiError => {
  return createError('ENTITY_NOT_FOUND', `Entity '${entity}' not found in app config '${appId}'`);
};

export const csvImportError = (message: string, line?: number): ApiError => {
  return createError('CSV_IMPORT_ERROR', line ? `Line ${line}: ${message}` : message);
};
