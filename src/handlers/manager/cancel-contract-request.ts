import { MyContext } from '../../bot';
import { RemainingContractFields } from '../../common/types/contract';
import { UserStepModel } from '../../models/user-step.model';

export async function handleContractRequestCancellation(ctx: MyContext) {
  try {
    const userId = ctx!.from!.id;
    const userActions = await UserStepModel.findOne({ userId });
    if (!userActions) return;
    const {
      uniqueId,
      contractId,
      contractAmount,
      contractDate,
      currency,
      info,
      description,
      managerConfirmationMessageId,
      ...remainingData
    } = userActions.data;

    userActions.data = remainingData as RemainingContractFields;
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.reply(
      userActions?.data.language === 'uz' ? '❌ Bekor qilindi' : '❌ Отменено'
    );
    userActions.step === 'main_menu';
    userActions.markModified('step');
    await userActions.save();
  } catch (err) {
    console.error('❌ Error in handleContractRequestConfirmation:', err);
    await ctx.reply('❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.');
  }
}
