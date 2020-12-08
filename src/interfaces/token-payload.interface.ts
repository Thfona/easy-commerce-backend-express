import { role } from '../types/role.type';

export interface TokenPayload {
  id: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  role: role;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}
