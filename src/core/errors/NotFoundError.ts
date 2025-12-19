import AppError from "./AppError";

export default class NotFoundError extends AppError {
  constructor(message = "Not Found", details?: any) {
    super(message, 404, details);
    this.name = "NotFoundError";
  }
}
