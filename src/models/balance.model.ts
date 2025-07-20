import { Schema, model } from "mongoose";

const BalanceSchema = new Schema(
  {
    balance: { type: Number, default: 0 },
    description: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

export const BalanceModel = model("balance", BalanceSchema);
