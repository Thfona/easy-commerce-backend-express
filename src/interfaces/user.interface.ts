import { Document } from 'mongoose';

export interface UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  fullName(): string;
}

export interface UserDocumentInterface extends UserInterface, Document {}
