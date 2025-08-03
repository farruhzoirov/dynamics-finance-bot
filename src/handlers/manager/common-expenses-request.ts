import { MyContext } from '../../bot';
import { TransactionType } from '../../common/enums/transaction.enum';
import { UserStepModel } from '../../models/user-step.model';
import { UserModel } from '../../models/user.model';

export async function handleCommonExpensesRequest(ctx: MyContext) {
  const expenseType = ctx.callbackQuery?.data;
  const userId = ctx.from?.id;
  const userActions = await UserStepModel.findOne({ userId: userId });
  if (!userActions) return;

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

  await ctx.answerCallbackQuery();

  if (
    (Object.values(TransactionType) as string[]).includes(expenseType as string)
  ) {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_common_expense_amount',
          data: {
            ...userActions?.data,
            type: expenseType,
            expenseType: expenseType
          }
        }
      },
      { upsert: true }
    );
  }

  return await ctx.reply(
    userActions?.data?.language === 'uz'
      ? 'Iltimos, miqdorini kiriting:'
      : 'Пожалуйста, введите сумму:'
  );
}

export async function handleCommonExpenseCurrency(ctx: MyContext) {
  await ctx.answerCallbackQuery();
  const userId = ctx!.from!.id;
  const message = ctx!.callbackQuery!.message;
  const chatId = message!.chat!.id;
  const messageId = message?.message_id;
  // @ts-ignore
  const currency = ctx!.callbackQuery!.data.split('_')[2].toUpperCase();
  const userActions = await UserStepModel.findOne({ userId: userId });
  if (!userActions) return;

  if (!chatId || !messageId) return;

  await ctx.api.deleteMessage(chatId, messageId);

  if (userActions && userActions.step === 'ask_common_expense_currency') {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_common_expense_description',
          data: {
            ...userActions?.data,
            commonExpenseCurrency: currency
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
