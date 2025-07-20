import { MyContext } from "../bot";
import {
  getMainMenuKeyboardForManager,
  getMainMenuKeyboardForCashier,
  getMainMenuKeyboardForDirector,
} from "../keyboards";
import { UserStepModel } from "../models/user-step.model";
import { UserModel } from "../models/user.model";

const ROLE_KEYBOARD_MAP: Record<string, (userActions: any) => any> = {
  manager: getMainMenuKeyboardForManager,
  director: getMainMenuKeyboardForDirector,
  cashier: getMainMenuKeyboardForCashier,
};

export async function handleMainMenu(ctx: MyContext) {
  const [user, userActions] = await Promise.all([
    UserModel.findOne({ userId: ctx.from?.id }),
    UserStepModel.findOne({ userId: ctx.from?.id }),
  ]);
  if (!user && !userActions) return;

  const keyboardFunction = ROLE_KEYBOARD_MAP[user!.role];
  await ctx.reply(
    userActions?.data?.language === "uz"
      ? "⬇️ Asosiy menyu"
      : "⬇️ Главное меню",
    {
      reply_markup: keyboardFunction(userActions),
    },
  );
  userActions!.step = "main_menu";
  await userActions!.save();
}
