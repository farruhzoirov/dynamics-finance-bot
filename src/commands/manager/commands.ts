import { bot } from '../../bot';
import { handleCommonExpensesRequest } from '../../handlers/manager/common-expenses-request';

bot.callbackQuery(
  ['office', 'share', 'advance', 'income'],
  handleCommonExpensesRequest
);
