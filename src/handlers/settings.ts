import { Keyboard } from "grammy";
import { MyContext } from "../bot";
import { UserStepModel } from "../models/user-step.model";

export async function getSettingsMenu(ctx: MyContext) {
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (!findUserActions) return;

  findUserActions.step = "settings";
  await findUserActions.save();

  const settingsMenu = new Keyboard()
    .text(
      findUserActions?.data?.language === "uz"
        ? "🌐 Tilni o'zgartirish"
        : "🌐 Изменить язык",
    )
    .row()
    .text(findUserActions?.data?.language === "uz" ? "⬅️ Ortga" : " ⬅️ Назад")
    .row();

  await ctx.reply(
    findUserActions?.data?.language === "uz"
      ? "⬇️ Sozlamalar menusi"
      : " ⬇️Настройки меню",
    {
      reply_markup: settingsMenu.resized(),
    },
  );
}

export async function changeLanguageHandler(ctx: MyContext) {
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (!findUserActions) return;

  if (findUserActions.data.language === "uz") {
    findUserActions.data.language = "ru";
  } else {
    findUserActions.data.language = "uz";
  }
  console.log(findUserActions);
  findUserActions.markModified("data"); // <-- MUHIM!
  await findUserActions.save();

  //   await ctx.answerCallbackQuery();
  //   await ctx.editMessageReplyMarkup();
  await ctx.reply(
    findUserActions.data.language === "uz"
      ? "Til o'zgartirildi."
      : "Язык изменен.",
  );
}
