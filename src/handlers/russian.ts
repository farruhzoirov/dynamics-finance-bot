import { MyContext } from '../bot';
import { UserStepModel } from '../models/user-step.model';
import { handleInitialMenu } from './initial';

export async function handleRussianLang(ctx: MyContext) {
  const findUserAction = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (findUserAction && !findUserAction?.data?.language) {
    findUserAction.data.language = 'ru';
    findUserAction.step = 'lang';
    await findUserAction.save();
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup();
    await ctx.editMessageText('Язык выбран..');
    await handleInitialMenu(ctx);
  }
}
