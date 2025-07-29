import { Schema, model } from 'mongoose';
import { ContractStatuses } from '../common/enums/contract-status.enum';

const CashierActionSchema = new Schema(
  {
    contractId: { type: Number },
    messageId: { type: Number },
    action: { type: String, enum: ContractStatuses },
    actionDate: { type: String },
    cashierId: { type: Number },
    cashierName: { type: String }
  },
  {
    timestamps: true
  }
);

export const CashierActionModel = model('cashieraction', CashierActionSchema);

CashierActionSchema.index({ cashierId: 1 });
