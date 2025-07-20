import { Schema, model } from "mongoose";

const userStepSchema = new Schema({
  userId: { type: Number, required: true, unique: true },
  step: { type: String, required: true, default: "start" },
  data: { type: Object, default: {} },
});

export const UserStepModel = model("userStep", userStepSchema);
