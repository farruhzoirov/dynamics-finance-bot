import { MyContext } from '../bot';
import { UserModel } from '../models/user.model';
import { UserStepModel } from '../models/user-step.model';
import { TransactionType } from '../common/enums/transaction.enum';
import { getCurrency } from '../helpers/get-currency';
import { getBalance } from '../helpers/get-balance';
import { Currency } from '../common/enums/currency.enum';
import { checkBalanceAndProceedTransaction } from '../helpers/check-balance';
import { getCurrencyRates } from '../services/get-currency.service';

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

  // if (userActions!.step === 'main_menu') {
  await UserStepModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        step: 'ask_amount_expense',
        data: {
          ...userActions?.data,
          type: TransactionType.EXPENSE
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
  // }
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
      const currencyRates = await getCurrencyRates();
      if (!currencyRates) return await ctx.reply('Error in getCurrencyRates');
      const balance = await getBalance(
        userActions.data.currency === Currency.USD ? Currency.USD : Currency.UZS
      );

      const transaction = await checkBalanceAndProceedTransaction(
        ctx,
        balance.balance,
        amount,
        currencyRates.saleValue,
        currency,
        userActions.data.language,
        type,
        description
      );
      userActions.data = rest;
      userActions.step = 'main_menu';
      await userActions.save();

      if (transaction) {
        await ctx.reply(
          userActions.data.language === 'uz'
            ? "Ma'lumotlar muvaffaqiyatli saqlandi. ✅"
            : 'Данные успешно сохранены. ✅'
        );
      }
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
