import AppError from "./AppError";

export default class ExternalServiceError extends AppError {
  constructor(message = "External Service Error", details?: any) {
    super(message, 502, details);
    this.name = "ExternalServiceError";
  }
}
