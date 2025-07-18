import { Schema, model } from "mongoose";

const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, default: null },
  userFirstName: { type: String, default: null },
  userLastName: { type: String, default: null },
  phone: { type: String, default: null },
  role: {
    type: String,
    enum: ["manager", "cashier", "director"],
    default: "director",
  },
});

export const UserModel = model("user", userSchema);
