import { TransactionModel } from '../models/transaction.model';
import { TransactionType } from '../common/enums/transaction.enum';

export async function getBalance(currency: string) {
  const result = await TransactionModel.aggregate([
    {
      $match: { currency: currency }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        incomeTotal: {
          $sum: {
            $cond: [
              { $eq: ['$_id', TransactionType.income] },
              '$totalAmount',
              0
            ]
          }
        },
        expenseTotal: {
          $sum: {
            $cond: [
              { $eq: ['$_id', TransactionType.expense] },
              '$totalAmount',
              0
            ]
          }
        }
      }
    },
    // Project the final result with the balance calculation
    {
      $project: {
        _id: 0,
        balance: { $subtract: ['$incomeTotal', '$expenseTotal'] },
        incomeTotal: 1,
        expenseTotal: 1
      }
    }
  ]);

  return result[0] || { balance: 0, incomeTotal: 0, expenseTotal: 0 };
}
