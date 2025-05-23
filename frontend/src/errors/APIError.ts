/** Унифицированная ошибка, пригодная для toasts/логгера */
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}
