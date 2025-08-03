import { Schema, model } from 'mongoose';
import { ContractStatuses } from '../common/enums/contract-status.enum';
import { TransactionType } from '../common/enums/transaction.enum';

const CashierActionSchema = new Schema(
  {
    contractId: { type: Number, default: null },
    expenseTypeId: { type: Number, default: null },
    expenseType: { type: String, enum: TransactionType, default: null },
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
