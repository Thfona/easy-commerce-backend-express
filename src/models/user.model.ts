import { model, Schema } from 'mongoose';
import { UserDocumentInterface } from '../interfaces/user.interface';

const nameSchema = new Schema({
  first: { type: String, required: true, min: 3, max: 255 },
  last: { type: String, required: true, min: 3, max: 255 }
});

const userSchema = new Schema({
  name: { type: nameSchema, required: true },
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, min: 6, max: 1024 },
  active: { type: Boolean, required: true },
  validated: { type: Boolean, required: true },
  validationToken: { type: String },
  tokenVersion: { type: Number, default: 0 },
  date: { type: Date, default: Date.now, required: true }
});

userSchema.methods.fullName = function (): string {
  return `${this.name.first} ${this.name.last}`;
};

export const userModel = model<UserDocumentInterface>('User', userSchema);
