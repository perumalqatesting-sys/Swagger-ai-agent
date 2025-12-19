import AppError from "./AppError";

export default class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, 401, details);
    this.name = "UnauthorizedError";
  }
}
