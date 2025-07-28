import { Schema, model } from 'mongoose';
import { Currency } from '../common/enums/currency.enum';

const BalanceSchema = new Schema(
  {
    balance: { type: Number, default: 0 },
    currency: { type: String, enum: Currency, required: true }
  },
  {
    timestamps: true
  }
);

export const BalanceModel = model('balance', BalanceSchema);
