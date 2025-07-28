import { Keyboard } from 'grammy';
import { MyContext } from '../bot';
import { UserStepModel } from '../models/user-step.model';

export async function handleBack(ctx: MyContext) {
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (!findUserActions) return;

  if (findUserActions.step === 'settings') {
    findUserActions.step = 'main_menu';
    findUserActions.markModified('step');
    await findUserActions.save();

    const backKeyboard = new Keyboard()
      .text(
        findUserActions?.data?.language === 'uz'
          ? '🏠 Asosiy menyu'
          : '🏠 Главное меню'
      )
      .text(
        findUserActions?.data?.language === 'uz'
          ? '⚙ Sozlamalar'
          : '⚙ Настройки'
      )
      .row();

    await ctx.reply(
      findUserActions.data?.language === 'uz'
        ? '⬇️ Asosiy menyu'
        : '⬇️ Главное меню',
      {
        reply_markup: backKeyboard.resized()
      }
    );
  }
}
