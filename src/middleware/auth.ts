import { Context } from "grammy";
import { configEnv } from "../config/config-env";
import { UserStepModel } from "../models/user-step.model";
import { UserModel } from "../models/user.model";

const AUTHORIZED_USERS = {
  [configEnv.CASHIER_ID]: "director",
  // "8061136800": "cashier",
} as const;

export async function authenticateUser(
  ctx: Context,
): Promise<boolean | string> {
  const userId = ctx.from?.id;
  const userName = ctx.from?.username;
  const userFirstName = ctx.from?.first_name;
  const userLastName = ctx.from?.last_name;

  if (!userId) {
    ctx.reply(
      "Siz botdan foydalanish uchun avtorizatsiyadan o'tishingiz kerak.",
    );
    return false;
  }

  if (!Object.keys(AUTHORIZED_USERS).includes(userId.toString())) {
    await ctx.reply(
      `Siz bu botdan foydalanish uchun ruxsatga ega emassiz. Iltimos, administrator bilan bog'laning.\n\nУ вас нет разрешения на использование этого бота. Пожалуйста, свяжитесь с администратором.`,
      {
        parse_mode: "HTML",
      },
    );
    return false;
  }

  const findUser = await UserModel.findOne({ userId: ctx.from?.id });

  if (!findUser) {
    await Promise.all([
      UserStepModel.create({
        userId: userId.toString(),
        step: "start",
        data: {},
      }),
      await UserModel.create({
        userId: userId.toString(),
        userName: userName || null,
        userFirstName: userFirstName || null,
        userLastName: userLastName || null,
        role: AUTHORIZED_USERS[ctx.from.id] || "director",
      }),
    ]);
  }
  console.log(findUser?.role);
  return findUser?.role as string;
}

export function hasPermission(
  userRole: string,
  requiredRoles: string[],
): boolean {
  return requiredRoles.includes(userRole);
}
