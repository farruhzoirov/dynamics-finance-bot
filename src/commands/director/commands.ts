import { bot } from '../../bot';
import { getBalanceHandler } from '../../handlers/balance';
import { handleInProgressContractConfirmation } from '../../handlers/director/in-progress.contract';
import { handleContractRejection } from '../../handlers/director/reject.contract';
import { handleContractApproval } from '../../handlers/director/approve.contract';
import { handleCommonExpenseRejection } from '../../handlers/director/reject.common-expense';
import { handleInProgressCommonExpenseConfirmation } from '../../handlers/director/inProgress.common-expense';
import { handleCommonExpenseApproval } from '../../handlers/director/approve.common-expense';

bot.callbackQuery(
  /^director_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^director_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^director_reject:(.+)$/, handleContractRejection);

bot.callbackQuery(
  /^director_in_progress_common_expense:([^:]+):([^:]+)$/,
  handleInProgressCommonExpenseConfirmation
);
bot.callbackQuery(
  /^director_approve_common_expense:([^:]+):([^:]+)$/,
  handleCommonExpenseApproval
);
bot.callbackQuery(
  /^director_reject_common_expense:([^:]+):([^:]+)$/,
  handleCommonExpenseRejection
);

bot.callbackQuery('balance', getBalanceHandler);

bot.callbackQuery('contracts_director');
