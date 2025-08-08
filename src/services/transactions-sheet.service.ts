import axios from 'axios';
import { MyContext } from '../bot';
import { ITransaction } from '../common/interfaces/transactions';
import { getExpenseTypeLabel } from '../helpers/get-common-expense-translations';
import { TransactionType } from '../common/enums/transaction.enum';

export async function sendTransactionsToSheet(
  ctx: MyContext,
  body: ITransaction
) {
  try {
    body.type = getExpenseTypeLabel(body.type as TransactionType, 'uz');
    if (!body.contractId) {
      body.contractId = 'Shartnoma uchun emas!';
    }
    body.sheetName = 'transactions';
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbwt4D9NW9EyWUsCQrbto7jI96Kzh4Nc8zhpOPwZVgbxx30Biw6EMC6nNPO591DWYDVyYQ/exec',
      body
    );
    if (response.data.result === 'success') return true;
  } catch (err) {
    console.error('Error in sendTransactionsToSheet', err);
    await ctx.reply('Error in sendTransactionsToSheet');
    return false;
  }
}
