import { bot } from '../../bot';
import { handleCommonExpensesRequest } from '../../handlers/manager/common-expenses-request';
import { handleContractBasedExpense } from '../../handlers/manager/contract-expense';

bot.callbackQuery('contract_expense', handleContractBasedExpense);

bot.callbackQuery(
  [
    'office',
    'share',
    'advance',
    'income',
    'expense_purchase',
    'expense_logistics',
    'expense_certificates',
    'expense_other',
    'expense_bonus',
    'expense_manager_share'
  ],
  handleCommonExpensesRequest
);
