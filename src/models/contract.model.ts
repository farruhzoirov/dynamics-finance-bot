import { Schema, model } from 'mongoose';
import { Currency } from '../common/enums/currency.enum';
import { ContractStatuses } from '../common/enums/contract-status.enum';

const ContractSchema = new Schema(
  {
    uniqueId: { type: Number, required: true, unique: true },
    contractId: { type: Number, required: true },
    contractAmount: { type: Number, required: true },
    currency: { type: String, enum: Currency, required: true },
    exchangeRate: { type: Number, required: true },
    contractDate: { type: String, required: true },
    info: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ContractStatuses, required: true }
  },
  {
    timestamps: true
  }
);

export const ContractModel = model('contract', ContractSchema);
