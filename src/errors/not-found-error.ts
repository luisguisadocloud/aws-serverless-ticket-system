import { HttpError } from "./http-error";

export class NotFoundError extends HttpError {
  constructor(code: string, message: string = "Resource not found") {
    super(404, code, message);
  }
}
