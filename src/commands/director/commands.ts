import { bot } from '../../bot';
import { getBalanceHandler } from '../../handlers/balance';
import { handleInProgressContractConfirmation } from '../../handlers/director/in-progress.contract';
import { handleContractRejection } from '../../handlers/director/reject.contract';
import { handleContractApproval } from '../../handlers/director/approve.contract';

bot.callbackQuery(
  /^director_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^director_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^director_reject:(.+)$/, handleContractRejection);

bot.callbackQuery('balance', getBalanceHandler);
bot.callbackQuery('contracts_director');
