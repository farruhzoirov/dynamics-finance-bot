import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';

export async function handleSearchingContracts(ctx: MyContext) {
  try {
    const userId = ctx.from!.id;
    const userActions = await UserStepModel.findOne({ userId });
    const lang = userActions?.data?.language === 'uz' ? 'uz' : 'ru';
    await ctx.answerCallbackQuery();
    if (!userActions) return;

    await ctx.reply(
      lang === 'uz'
        ? 'Shartnoma raqami yoki shartnoma unikal Idsini kiriting :'
        : 'Введите номер контракта или его уникальный ID:'
    );

    userActions.step = 'search_contract';
    userActions.markModified('step');
    await userActions.save();
  } catch (err) {
    console.error('Error in handleSearchingContracts', err);
    await ctx.reply('Error in handleSearchingContracts');
  }
}
