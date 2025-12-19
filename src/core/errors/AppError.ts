export default class AppError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}
