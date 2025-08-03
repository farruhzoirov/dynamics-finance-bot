import { MyContext } from '../bot';
import { Currency } from '../common/enums/currency.enum';
import { TransactionType } from '../common/enums/transaction.enum';
import { Languages } from '../common/types/languages';
import { TransactionModel } from '../models/transaction.model';
import { UserModel } from '../models/user.model';
import { getBalance } from './get-balance';

export async function checkBalanceAndProceedTransaction(
  ctx: MyContext,
  balance: number,
  amount: number,
  exchangeRate: number,
  currency: Currency,
  language: Languages,
  type: TransactionType,
  description: string,
  contractId?: number | null
) {
  try {
    const user = await UserModel.findOne({ userId: ctx.from?.id });
    if (balance < amount) {
      const difference = amount - balance;
      if (currency === Currency.USD) {
        const convertToSum = difference * exchangeRate;
        const balanceInSum = await getBalance(Currency.UZS);
        if (balanceInSum.balance < convertToSum) {
          await ctx.reply(
            language === 'uz'
              ? "❌ Balanceda yetarlicha mablag' yo'q. /balance"
              : '❌ Недостаточно средств на балансе. /balance'
          );
          return false;
        }
        const balance = await getBalance(Currency.USD);
        await Promise.all([
          TransactionModel.create({
            contractId: contractId,
            type: type,
            amount: balance.balance,
            currency: currency,
            exchangeRate: exchangeRate,
            description: description,
            createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
          }),
          TransactionModel.create({
            contractId: contractId,
            type: type,
            amount: convertToSum,
            currency: Currency.UZS,
            exchangeRate: exchangeRate,
            description: description,
            createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
          })
        ]);
      }
      if (currency === Currency.UZS) {
        const convertToUSD = difference / exchangeRate;
        const balanceInUSD = await getBalance(Currency.USD);
        if (balanceInUSD.balance < convertToUSD) {
          await ctx.reply(
            language === 'uz'
              ? "❌ Balanceda yetarlicha mablag' yo'q. /balance"
              : '❌ Недостаточно средств на балансе. /balance'
          );
          return false;
        }
        const [balanceInSum, getBalanceInUSD] = await Promise.all([
          getBalance(Currency.UZS),
          getBalance(Currency.USD)
        ]);
        const diff = amount - balanceInSum.balance;
        const withDrawFromUSD = getBalanceInUSD.balance * exchangeRate - diff;
        await Promise.all([
          TransactionModel.create({
            contractId: contractId,
            type: type,
            amount: balanceInSum.balance,
            currency: currency,
            exchangeRate: exchangeRate,
            description: description,
            createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
          }),
          TransactionModel.create({
            contractId: contractId,
            type: type,
            amount: getBalanceInUSD.balance,
            currency: Currency.USD,
            exchangeRate: exchangeRate,
            description: description,
            createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
          }),
          TransactionModel.create({
            contractId: contractId,
            type: TransactionType.INCOME,
            amount: withDrawFromUSD,
            currency: currency,
            exchangeRate: exchangeRate,
            description: description + '(USD -> UZS)',
            createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
          })
        ]);
      }
      return true;
    } else {
      await TransactionModel.create({
        type: type,
        contractId: contractId,
        amount: amount,
        currency: currency,
        exchangeRate: exchangeRate,
        description: description,
        createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
      });
      return true;
    }
  } catch (err) {
    console.error('Error in checkBalanceAndProceedTransaction', err);
    await ctx.reply('Error with Transaction');
    return false;
  }
}
