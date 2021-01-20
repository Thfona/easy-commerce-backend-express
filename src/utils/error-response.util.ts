import { ErrorResponseInterface } from '../interfaces/error-response.interface';

class ErrorResponseUtil {
  public getErrorResponse(
    codeSuffix: string,
    status: number,
    message: string,
    redirect?: boolean
  ): ErrorResponseInterface {
    return redirect == null
      ? {
          error: {
            status: status,
            code: status.toString().concat(codeSuffix),
            message: message
          }
        }
      : {
          error: {
            status: status,
            code: status.toString().concat(codeSuffix),
            message: message,
            redirect: redirect
          }
        };
  }
}

export const errorResponseUtil = new ErrorResponseUtil();
