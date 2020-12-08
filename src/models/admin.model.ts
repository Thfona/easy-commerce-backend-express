import { model, Schema } from 'mongoose';
import { AdminDocumentInterface } from '../interfaces/admin.interface';

const nameSchema = new Schema({
  first: { type: String, required: true, min: 3, max: 255 },
  last: { type: String, required: true, min: 3, max: 255 }
});

const adminSchema = new Schema({
  name: { type: nameSchema, required: true },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, min: 6, max: 1024 },
  tokenVersion: { type: Number, default: 0 },
  date: { type: Date, default: Date.now, required: true }
});

adminSchema.methods.fullName = function (): string {
  return `${this.name.first} ${this.name.last}`;
};

export const adminModel = model<AdminDocumentInterface>('Admin', adminSchema);
