import { Schema, model } from 'mongoose';
import { UserRoles } from '../common/enums/roles.enum';

const userSchema = new Schema(
  {
    userId: { type: Number, required: true, unique: true },
    userName: { type: String, default: null },
    userFirstName: { type: String, default: null },
    userLastName: { type: String, default: null },
    phone: { type: String, default: null },
    role: {
      type: String,
      enum: UserRoles,
      default: 'director'
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = model('user', userSchema);
