import { Schema, model } from 'mongoose';
import { Currency } from '../common/enums/currency.enum';
import { ContractStatuses } from '../common/enums/contract-status.enum';
import { IContract } from '../common/interfaces/contract';

const ContractSchema = new Schema(
  {
    uniqueId: { type: Number, required: true, unique: true },
    contractId: { type: Number, required: true, unique: true },
    contractAmount: { type: Number, required: true },
    currency: { type: String, enum: Currency, required: true },
    exchangeRate: { type: Number, required: true },
    contractDate: { type: String, required: true },
    info: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ContractStatuses, required: true },

    managerConfirmationMessageId: { type: Number, default: null },
    managerUserId: { type: Number, default: null }
  },
  {
    timestamps: true
  }
);

export const ContractModel = model<IContract>('contract', ContractSchema);
