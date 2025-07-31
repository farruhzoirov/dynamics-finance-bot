import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';

export async function handleCommonExpenseRequestCancellation(ctx: MyContext) {
  try {
    const userId = ctx!.from!.id;
    const userActions = await UserStepModel.findOne({ userId });
    if (!userActions) return;
    const {
      type,
      expenseType,
      commonExpenseAmount,
      commonExpenseCurrency,
      managerInfo,
      commonExpenseDescription,
      commonExpenseConfirmationMessageId,
      ...rest
    } = userActions.data;

    userActions.data = rest;
    userActions.markModified('data');
    await userActions.save();
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.reply(
      userActions?.data.language === 'uz' ? '❌ Bekor qilindi' : '❌ Отменено'
    );
    userActions.step === 'main_menu';
    userActions.markModified('step');
    await userActions.save();
  } catch (err) {
    console.error('❌ Error in handleCommonExpenseRequestCancellation:', err);
    await ctx.reply('❌ Error in handleCommonExpenseRequestCancellation:');
  }
}
