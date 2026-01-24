export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize: number = 50 * 1024 * 1024) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    super(`Le fichier dépasse la taille maximale autorisée (${maxMB} MB)`, 413, 'FILE_TOO_LARGE');
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(mimeType: string) {
    super(`Type de fichier non supporté: ${mimeType}`, 415, 'UNSUPPORTED_FILE_TYPE');
  }
}

export class StorageError extends AppError {
  constructor(message: string = 'Erreur de stockage') {
    super(message, 500, 'STORAGE_ERROR');
  }
}
