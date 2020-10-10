import { model, Schema } from 'mongoose';
import { UserDocumentInterface } from '../interfaces/user.interface';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: { unique: true } },
  active: { type: Boolean, required: true }
});

userSchema.methods.fullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export default model<UserDocumentInterface>('User', userSchema);
