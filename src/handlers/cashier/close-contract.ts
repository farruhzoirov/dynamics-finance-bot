import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';

export async function handleClosingContract(ctx: MyContext) {
  const userId = ctx.from!.id;
  const userActions = await UserStepModel.findOne({ userId: userId });
  await ctx.answerCallbackQuery();
  if (!userActions) return;

  userActions.step = 'ask_contract_id_for_closing_contract';
  userActions.markModified('step');
  await userActions.save();

  await ctx.reply(
    userActions.data.language === 'uz'
      ? 'Shartnoma raqami yoki shartnoma unikal Idsini kiriting :'
      : 'Введите номер контракта или его уникальный ID:'
  );
}
