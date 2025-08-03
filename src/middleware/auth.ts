import { Context, NextFunction } from 'grammy';
import { configEnv } from '../config/config-env';
import { UserStepModel } from '../models/user-step.model';
import { UserModel } from '../models/user.model';
import { UserRoles } from '../common/enums/roles.enum';

const AUTHORIZED_USERS = {
  [configEnv.CASHIER_ID]: UserRoles.manager,
  8061136800: UserRoles.director,
  830735800: UserRoles.manager,
  689888057: UserRoles.director,
  106295438: UserRoles.manager,
  1258718142: UserRoles.cashier,
  7781258426: UserRoles.cashier
} as const;

export async function authMiddleware(ctx: Context, next: NextFunction) {
  const isAuth = await authenticateUser(ctx);
  if (isAuth) {
    await next();
  }
}

export async function authenticateUser(
  ctx: Context
): Promise<boolean | string> {
  const userId = ctx.from?.id;
  const userName = ctx.from?.username;
  const userFirstName = ctx.from?.first_name;
  const userLastName = ctx.from?.last_name;
  if (!userId) {
    ctx.reply(
      "Siz botdan foydalanish uchun avtorizatsiyadan o'tishingiz kerak."
    );
    return false;
  }

  if (!Object.keys(AUTHORIZED_USERS).includes(userId.toString())) {
    await ctx.reply(
      `Siz bu botdan foydalanish uchun ruxsatga ega emassiz. Iltimos, administrator bilan bog'laning.\n\nУ вас нет разрешения на использование этого бота. Пожалуйста, свяжитесь с администратором.`,
      {
        parse_mode: 'HTML'
      }
    );
    return false;
  }

  let user = await UserModel.findOne({ userId: ctx.from?.id });

  if (!user) {
    await Promise.all([
      UserStepModel.create({
        userId: userId,
        step: 'main_menu',
        data: {}
      }),
      UserModel.create({
        userId: userId,
        userName: userName || null,
        userFirstName: userFirstName || null,
        userLastName: userLastName || null,
        role: AUTHORIZED_USERS[ctx.from.id] || 'director'
      })
    ]);
  }
  await UserModel.updateOne(
    { userId },
    {
      $set: {
        userName: ctx?.from?.username,
        userFirstName: ctx?.from?.first_name,
        userLastName: ctx?.from?.last_name,
        role: AUTHORIZED_USERS[ctx.from.id]
      }
    },
    { upsert: true }
  );

  return true;
}

export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}
