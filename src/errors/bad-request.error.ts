import { HttpError } from './http-error';

export class BadRequestError extends HttpError {
  constructor(message: string = "Validation error") {
    super(400, message);
  }
}
