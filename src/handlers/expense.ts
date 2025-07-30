import { MyContext } from '../bot';
import { UserModel } from '../models/user.model';
import { UserStepModel } from '../models/user-step.model';
import { TransactionType } from '../common/enums/transaction.enum';
import { getCurrency } from '../helpers/get-currency';
import { TransactionModel } from '../models/transaction.model';
import { getBalance } from '../helpers/get-balance';
import { Currency } from '../common/enums/currency.enum';

export async function handleExpense(ctx: MyContext) {
  await ctx.answerCallbackQuery();
  const userId = ctx?.from?.id;
  let [user, userActions] = await Promise.all([
    UserModel.findOne({ userId: userId }),
    UserStepModel.findOne({ userId: userId })
  ]);

  await UserModel.updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
        userName: ctx?.from?.username,
        userFirstName: ctx?.from?.first_name,
        userLastName: ctx?.from?.last_name
      }
    },
    { upsert: true }
  );

  if (userActions!.step === 'main_menu') {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_amount_expense',
          data: {
            ...userActions?.data,
            type: TransactionType.expense
          }
        }
      },
      { upsert: true, new: true }
    );
    return await ctx.reply(
      userActions?.data?.language === 'uz'
        ? 'Iltimos, chiqim miqdorini kiriting:'
        : 'Пожалуйста, Введите сумму вывода::'
    );
  }
}

export async function handleExpenseCurrency(ctx: MyContext) {
  await ctx.answerCallbackQuery();
  const userId = ctx!.from!.id;
  const message = ctx!.callbackQuery!.message;
  const chatId = message!.chat!.id;
  const messageId = message?.message_id;
  // @ts-ignore
  const currency = ctx!.callbackQuery!.data.split('_')[1].toUpperCase();
  const userActions = await UserStepModel.findOne({ userId: userId });
  if (!userActions) return;

  if (!chatId || !messageId) return;

  await ctx.api.deleteMessage(chatId, messageId);

  if (userActions && userActions.step === 'ask_currency') {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_description_expense',
          data: {
            ...userActions?.data,
            currency: currency
          }
        }
      },
      { upsert: true, new: true }
    );
    return await ctx.reply(
      userActions.data.language === 'uz'
        ? 'Izoh kiriting :'
        : 'Введите описание :'
    );
  }
}

export async function handleExpenseConfirmation(ctx: MyContext) {
  try {
    await ctx.answerCallbackQuery();
    const userId = ctx!.from!.id;
    const answer = ctx!.callbackQuery!.data?.split('_')[2];
    const message = ctx!.callbackQuery!.message;
    const chatId = message!.chat.id;
    const messageId = message?.message_id;
    const userActions = await UserStepModel.findOne({ userId: userId });

    if (!userActions) return;

    if (!chatId || !messageId) return;

    await ctx.api.deleteMessage(chatId, messageId);

    if (answer === 'no') {
      const { type, amount, currency, description, ...rest } = userActions.data;
      userActions.data = rest;
      userActions.step = 'main_menu';
      userActions.markModified('data');
      await userActions.save();
      await ctx.reply(
        userActions.data.language === 'uz' ? 'Bekor qilindi' : 'Отменено'
      );
    }

    if (answer === 'yes') {
      const { type, amount, currency, description, ...rest } = userActions.data;
      const exchangeRate = await getCurrency();
      if (exchangeRate === 0) {
        await ctx.reply('Error: Exchange rate is 0');
        return;
      }

      const user = await UserModel.findOne({ userId: userId });

      const balance = await getBalance(
        userActions.data.currency === Currency.USD ? Currency.USD : Currency.UZS
      );
      if (balance.balance < amount) {
        const difference = amount - balance.balance;
        if (userActions.data.currency === Currency.USD) {
          const convertToSum = difference * exchangeRate;
          const balanceInSum = await getBalance(Currency.UZS);
          if (balanceInSum.balance < convertToSum) {
            await ctx.reply(
              userActions.data.language === 'uz'
                ? "Sizning balansingizda yetarli mablag' yo'q."
                : 'Недостаточно средств на вашем балансе.'
            );
            return;
          }
          const balance = await getBalance(Currency.USD);
          await Promise.all([
            TransactionModel.create({
              type: type,
              amount: balance.balance,
              currency: currency,
              exchangeRate: exchangeRate,
              description: description,
              createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
            }),
            TransactionModel.create({
              type: type,
              amount: convertToSum,
              currency: Currency.UZS,
              exchangeRate: exchangeRate,
              description: description,
              createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
            })
          ]);
        }
        if (userActions.data.currency === Currency.UZS) {
          const convertToUSD = difference / exchangeRate;
          const balanceInUSD = await getBalance(Currency.USD);
          if (balanceInUSD.balance < convertToUSD) {
            await ctx.reply(
              userActions.data.language === 'uz'
                ? "Sizning balansingizda yetarli mablag' yo'q."
                : 'Недостаточно средств на вашем балансе.'
            );
            return;
          }

          const [balanceInSum, getBalanceInUSD] = await Promise.all([
            getBalance(Currency.UZS),
            getBalance(Currency.USD)
          ]);
          const diff = amount - balanceInSum.balance;
          const withDrawFromUSD = getBalanceInUSD.balance * exchangeRate - diff;
          await Promise.all([
            TransactionModel.create({
              type: type,
              amount: balanceInSum.balance,
              currency: currency,
              exchangeRate: exchangeRate,
              description: description,
              createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
            }),
            TransactionModel.create({
              type: type,
              amount: getBalanceInUSD.balance,
              currency: Currency.USD,
              exchangeRate: exchangeRate,
              description: description,
              createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
            }),
            TransactionModel.create({
              type: TransactionType.income,
              amount: withDrawFromUSD,
              currency: currency,
              exchangeRate: exchangeRate,
              description: description,
              createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
            })
          ]);
        }
      } else {
        await TransactionModel.create({
          type: type,
          amount: amount,
          currency: currency,
          exchangeRate: exchangeRate,
          description: description,
          createdBy: `${user?.userFirstName || ''} ${user?.userLastName || ''}`
        });
      }

      userActions.data = rest;
      userActions.step = 'main_menu';
      await userActions.save();
      await ctx.reply(
        userActions.data.language === 'uz'
          ? "Ma'lumotlar muvaffaqiyatli saqlandi. ✅"
          : 'Данные успешно сохранены. ✅'
      );
    }
  } catch (err) {
    const userActions = await UserStepModel.findOne({ userId: ctx?.from?.id });
    if (userActions) {
      userActions!.step = 'main_menu';
      userActions?.markModified('step');
      await userActions.save();
    }
    console.error('Error in handleExpenseConfirmation', err);
    ctx.reply('Error in handleExpenseConfirmation');
  }
}
