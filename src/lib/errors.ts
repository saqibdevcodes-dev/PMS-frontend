export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
    public details?: { path: (string | number)[]; message: string }[],
  ) {
    super(message);
  }
}
