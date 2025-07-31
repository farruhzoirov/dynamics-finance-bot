import { Schema, model } from 'mongoose';
import { Currency } from '../common/enums/currency.enum';
import { CommonExpenseStatuses } from '../common/enums/common-expense.enum';

const CommonExpenseSchema = new Schema(
  {
    uniqueId: { type: Number, required: true },
    expenseType: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: Currency, required: true },
    exchangeRate: { type: Number, required: true },
    managerInfo: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: CommonExpenseStatuses, required: true },

    managerConfirmationMessageId: { type: Number, required: true },
    managerUserId: { type: Number, required: true }
  },
  {
    timestamps: true
  }
);

export const CommonExpenseModel = model('commonexpense', CommonExpenseSchema);
CommonExpenseSchema.index({ uniqueId: 1 });
