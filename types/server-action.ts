export type ServerActionResult<T = unknown> = Promise<
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: { form?: string; _errors?: string[] } & T;
    }
>;
