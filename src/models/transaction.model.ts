import { Schema, model } from "mongoose";
import { TransactionType } from "../common/enums/transaction.enum";
import { Currency } from "../common/enums/currency.enum";

const TransactionSchema = new Schema(
  {
    type: { type: String, enum: TransactionType, default: null },
    amount: { type: Number, default: 0, required: true },
    currency: { type: String, enum: Currency, required: true },
    exchangeRate: { type: Number, default: 1 },
    contractId: { type: String, default: null },
    description: { type: String, default: null },
    createdBy: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

export const TransactionModel = model("transaction", TransactionSchema);
