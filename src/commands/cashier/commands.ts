import { bot } from '../../bot';
import { handleContractApproval } from '../../handlers/cashier/approve.contract';
import { handleInProgressContractConfirmation } from '../../handlers/cashier/in-progress.contract';
import { handleContractRejection } from '../../handlers/cashier/reject.contract';

bot.callbackQuery(
  /^cashier_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^cashier_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^cashier_reject:(.+)$/, handleContractRejection);
