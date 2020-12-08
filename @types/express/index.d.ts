import { TokenPayload } from '../../src/interfaces/token-payload.interface';

declare global {
  namespace Express {
    export interface Request {
      tokenPayload: TokenPayload;
    }
  }
}
