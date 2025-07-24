export class HttpError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;
  
  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}