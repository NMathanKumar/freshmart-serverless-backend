const defaultProblemTitleByStatus: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error'
};

export class DomainError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly type: string;
  public readonly title: string;

  constructor(message: string, statusCode = 400, details?: unknown, type = 'about:blank', title?: string) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
    this.details = details;
    this.type = type;
    this.title = title ?? defaultProblemTitleByStatus[statusCode] ?? this.name;
  }
}
