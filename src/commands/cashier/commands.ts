import { bot } from '../../bot';
import { handleContractApproval } from '../../handlers/cashier/approve.contract';
import { handleInProgressContractConfirmation } from '../../handlers/cashier/in-progress.contract';
import { handleContractRejection } from '../../handlers/cashier/reject.contract';
import { handleInProgressCommonExpenseConfirmation } from '../../handlers/cashier/inProgress.common-expense';
import { handleCommonExpenseApproval } from '../../handlers/cashier/approve.common-expense';
import { handleCommonExpenseRejection } from '../../handlers/cashier/reject.common-expense';

bot.callbackQuery(
  /^cashier_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^cashier_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^cashier_reject:(.+)$/, handleContractRejection);

bot.callbackQuery(
  /^common_expense_cashier_in_progress:([^:]+):([^:]+):([^:]+)$/,
  handleInProgressCommonExpenseConfirmation
);

bot.callbackQuery(
  /^common_expense_cashier_approve:([^:]+):([^:]+):([^:]+)$/,
  handleCommonExpenseApproval
);

bot.callbackQuery(
  /^common_expense_cashier_reject:([^:]+):([^:]+):([^:]+)$/,
  handleCommonExpenseRejection
);
