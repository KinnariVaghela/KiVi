/**
 * Custom operational error class for the application.
 * Allows services to throw errors with specific HTTP status codes.
 */
export class AppError extends Error {
  public readonly status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
