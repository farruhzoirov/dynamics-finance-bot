import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';

export async function handleContractBasedExpense(ctx: MyContext) {
  try {
    const userId = ctx.from?.id;
    const userActions = await UserStepModel.findOne({ userId: userId });
    await ctx.answerCallbackQuery();
    if (!userActions) return;
    await ctx.reply(
      userActions.data.language === 'uz'
        ? 'Shartnoma raqami yoki shartnoma unikal Idsini kiriting :'
        : 'Введите номер контракта или его уникальный ID:'
    );

    const { expenseBasedContractId, ...rest } = userActions.data;
    userActions.data = rest;
    userActions.step = 'ask_contract_id_for_expense';
    userActions.markModified('step');
    userActions.markModified('data');
    await userActions.save();
  } catch (err) {
    console.error('Error in handleContractBasedExpense', err);
    await ctx.reply('Error in handleContractBasedExpense');
  }
}
