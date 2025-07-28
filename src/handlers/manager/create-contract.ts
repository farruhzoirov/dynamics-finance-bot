import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';

export async function handleContractCreation(ctx: MyContext) {
  try {
    const userId = ctx?.from?.id;
    const userActions = await UserStepModel.findOne({ userId: userId });
    await ctx.answerCallbackQuery();

    if (!userActions) return;

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_contract_id'
        }
      },
      { upsert: true }
    );

    await ctx.reply(
      userActions?.data.language === 'uz'
        ? 'Shartnoma raqamini kiriting:'
        : 'Введите номер договора:'
    );
  } catch (err) {
    console.error(err);
    await ctx.reply('Error creation contract: handleContractCreation');
  }
}
