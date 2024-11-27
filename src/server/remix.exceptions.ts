export interface ReactRouterError {
  data: {
    message?: string;
    code?: number;
    success?: false;
  };
  internal: boolean;
  status: number;
  statusText: string;
}

export class ReactRouterException extends Error {
  message: string;

  code: number;

  constructor(message?: string, code?: number) {
    super(message);
    this.message = message ?? "Internal Server Error";
    this.code = code ?? 500;
  }

  toResponse() {
    return new Response(
      JSON.stringify({
        message: this.message,
        code: this.code,
        success: false,
      }),
      {
        status: this.code,
        statusText: this.message,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
