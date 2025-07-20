import { Keyboard } from "grammy";
import { MyContext } from "../bot";
import { UserStepModel } from "../models/user-step.model";

export async function handleInitialMenu(ctx: MyContext) {
  const user = await UserStepModel.findOne({ userId: ctx.from?.id });
  const mainMenu = new Keyboard()
    .text(user?.data?.language === "uz" ? "🏠 Asosiy menyu" : "🏠 Главное меню")
    .text(user?.data?.language === "uz" ? "⚙ Sozlamalar" : "⚙ Настройки")
    .row();

  await ctx.reply(user?.data?.language === "uz" ? "⬇️ Menyular" : "⬇️ Меню", {
    reply_markup: mainMenu.resized(),
  });
}
