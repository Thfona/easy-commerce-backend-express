import { Document } from 'mongoose';

export interface UserInterface {
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
  active: boolean;
  validated: boolean;
  validationToken: string;
  tokenVersion: number;
  date: Date;
  fullName(): string;
}

export interface UserDocumentInterface extends UserInterface, Document {}
