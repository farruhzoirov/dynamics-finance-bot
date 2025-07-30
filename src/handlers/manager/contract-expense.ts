import { MyContext } from '../../bot';
import { getForContractExpenseKeyboardForManager } from '../../keyboards';
import { UserStepModel } from '../../models/user-step.model';

export async function handleContractBasedExpense(ctx: MyContext) {
  const userId = ctx.from?.id;
  const userActions = await UserStepModel.findOne({ userId: userId });
  ctx.answerCallbackQuery();
  const contractBasedExpenseText =
    userActions?.data.language === 'uz'
      ? "Shartnoma bo'yicha xarajat turini tanlang:"
      : 'Выберите вид расхода по договору:';

  await ctx.reply(contractBasedExpenseText, {
    reply_markup: getForContractExpenseKeyboardForManager(userActions)
  });
}
