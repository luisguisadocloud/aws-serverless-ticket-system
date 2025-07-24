import { HttpError } from './http-error';

export class BadRequestError extends HttpError {
  constructor(code: string, message: string = "Validation error", details: string[]) {
    super(400, code, message, details);
  }
}
