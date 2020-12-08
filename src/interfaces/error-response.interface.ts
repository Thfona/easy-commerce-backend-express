export interface ErrorResponseInterface {
  error: {
    status: number;
    code: string;
    message: string;
    redirect?: boolean;
  };
}
