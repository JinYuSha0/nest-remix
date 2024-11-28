export class GlobalResponse<T> {
  public readonly data: T;
  public readonly code: number;
  public readonly success: boolean;

  constructor(data: T, code?: number, success?: boolean) {
    this.data = data;
    this.code = code ?? 200;
    this.success = success ?? true;
  }

  toPlainObject() {
    return {
      data: this.data,
      code: this.code,
      success: this.success,
    };
  }

  toJson() {
    return JSON.stringify(this.toPlainObject());
  }
}
