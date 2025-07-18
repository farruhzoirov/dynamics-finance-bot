import { InlineKeyboard, Keyboard } from "grammy";
import { authenticateUser } from "../middleware/auth";
import { getMainMenuKeyboard } from "../keyboards";
import { MyContext } from "../bot";
import { UserStepModel } from "../models/user-step.model";

export async function handleStart(ctx: MyContext) {
  const userRole = await authenticateUser(ctx);
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (!findUserActions) return;

  if (
    findUserActions &&
    !findUserActions?.data?.language &&
    findUserActions.step === "start"
  ) {
    const languageKeyboard = new InlineKeyboard()
      .text("🇺🇿 Oʻzbekcha", "uzbek")
      .text("🇷🇺 Русский", "russian");
    await ctx.reply("Tilni tanlang | Выберите язык:", {
      reply_markup: languageKeyboard,
    });
  }

  findUserActions.step = "lang";
  await findUserActions.save();

  if (findUserActions && findUserActions.step === "lang") {
    await ctx.api.setMyCommands([
      {
        command: "start",
        description: `${findUserActions.data?.language === "uz" ? "Botni ishga tushirish" : "Запустить бота"}`,
      },
    ]);

    await ctx.reply(
      findUserActions.data?.language === "uz"
        ? "Assalomu alaykum! Botga xush kelibsiz!"
        : "Здравствуйте! Добро пожаловать в бот!",
      {
        reply_markup: getMainMenuKeyboard(userRole as string, findUserActions),
      },
    );
    const mainMenu = new Keyboard()
      .text(
        findUserActions?.data?.language === "uz"
          ? "🏠 Asosiy menyu"
          : "🏠 Главное меню",
      )
      .text(
        findUserActions?.data?.language === "uz"
          ? "⚙ Sozlamalar"
          : "⚙ Настройки",
      )
      .row();

    await ctx.reply(
      findUserActions.data?.language === "uz"
        ? "⬇️ Asosiy menyu"
        : "⬇️ Главное меню",
      {
        reply_markup: mainMenu.resized(),
      },
    );
  }
}
