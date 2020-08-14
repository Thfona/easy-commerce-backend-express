import { Document, model, Schema } from 'mongoose';

export interface CustomerInterface extends Document {
  firstName: string;
  lastName: string;
  email: string;
  fullName(): string;
}

const customerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: { unique: true } }
});

customerSchema.methods.fullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export default model<CustomerInterface>('Customer', customerSchema);
