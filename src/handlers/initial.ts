import { Keyboard } from 'grammy';
import { MyContext } from '../bot';
import { UserStepModel } from '../models/user-step.model';
import { UserModel } from '../models/user.model';
import { UserRoles } from '../common/enums/roles.enum';

export async function handleInitialMenu(ctx: MyContext) {
  const [user, userActions] = await Promise.all([
    UserModel.findOne({ userId: ctx.from?.id }),
    UserStepModel.findOne({ userId: ctx.from?.id })
  ]);
  if (!userActions || !user) return;

  let mainMenu = new Keyboard()
    .text(
      userActions?.data?.language === 'uz'
        ? '🏠 Asosiy menyu'
        : '🏠 Главное меню'
    )
    .text(
      userActions?.data?.language === 'uz' ? '⚙ Sozlamalar' : '⚙ Настройки'
    )
    .row();

  switch (user.role) {
    case UserRoles.director:
    case UserRoles.cashier:
      mainMenu = new Keyboard()
        .text(
          userActions?.data?.language === 'uz'
            ? '🏠 Asosiy menyu'
            : '🏠 Главное меню'
        )
        .text(
          userActions?.data?.language === 'uz'
            ? '⚙ Sozlamalar'
            : '⚙ Настройки'
        )
        .row()
        .text(userActions?.data?.language === 'uz' ? '💳 Balans' : '💳 Баланс');
      break;
  }

  await ctx.reply(
    userActions?.data?.language === 'uz' ? '⬇️ Menyular' : '⬇️ Меню',
    {
      reply_markup: mainMenu.resized()
    }
  );
}
