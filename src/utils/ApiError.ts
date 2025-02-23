export class ApiError extends Error {
  response: Response;

  code: string | null = null;

  constructor(message: string, response: Response, code?: string) {
    super(message);
    this.response = response;
    this.code = code || null;
  }
}
