import { InlineKeyboard } from 'grammy';
import { MyContext } from '../bot';
import { UserStepModel } from '../models/user-step.model';
import { handleInitialMenu } from './initial';

export async function handleStart(ctx: MyContext) {
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (!findUserActions) return;

  if (
    findUserActions &&
    !findUserActions?.data?.language &&
    findUserActions.step === 'main_menu'
  ) {
    const languageKeyboard = new InlineKeyboard()
      .text('🇺🇿 Oʻzbekcha', 'uzbek')
      .text('🇷🇺 Русский', 'russian');
    await ctx.reply('Tilni tanlang | Выберите язык:', {
      reply_markup: languageKeyboard
    });
  }
  findUserActions.step = 'lang';
  await findUserActions.save();

  const userLang = findUserActions.data?.language ?? 'ru';

  if (findUserActions && findUserActions.step === 'lang') {
    await ctx.api.setMyCommands([
      {
        command: 'start',
        description: `${userLang === 'uz' ? 'Botni ishga tushirish' : 'Запустить бота'}`
      },
      {
        command: 'main_menu',
        description: `${userLang === 'uz' ? 'Asosiy menu' : 'Главное меню'}`
      }
    ]);
  }

  if (findUserActions.data?.language) {
    await handleInitialMenu(ctx);
  }
}
