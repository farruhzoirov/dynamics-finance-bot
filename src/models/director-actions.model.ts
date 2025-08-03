import { Schema, model } from 'mongoose';
import { ContractStatuses } from '../common/enums/contract-status.enum';
import { CommonExpenseStatuses } from '../common/enums/common-expense.enum';
import { TransactionType } from '../common/enums/transaction.enum';

const DirectorActionSchema = new Schema(
  {
    contractId: { type: Number, default: null },
    expenseTypeId: { type: Number, default: null },
    expenseType: { type: String, enum: TransactionType, default: null },
    messageId: { type: Number },
    action: { type: String, enum: ContractStatuses },
    actionDate: { type: String },
    directorId: { type: Number },
    directorName: { type: String }
  },
  {
    timestamps: true
  }
);

export const DirectorActionModel = model(
  'directoraction',
  DirectorActionSchema
);
DirectorActionSchema.index({ directorId: 1 });
DirectorActionSchema.index({ contractId: 1 });
DirectorActionSchema.index({ expenseTypeId: 1 });
