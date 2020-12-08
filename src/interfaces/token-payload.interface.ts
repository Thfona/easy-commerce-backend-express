export interface TokenPayload {
  id: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  tokenVersion: number;
  iat?: number;
  exp?: number;
}
