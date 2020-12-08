import { Document } from 'mongoose';

export interface AdminInterface {
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
  tokenVersion: number;
  date: Date;
  fullName(): string;
}

export interface AdminDocumentInterface extends AdminInterface, Document {}
