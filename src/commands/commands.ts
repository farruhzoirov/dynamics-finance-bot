import { bot } from "../bot";
import { handleStart } from "../handlers/start";
import {
  handleContractCreation,
  handleCreateContract,
} from "../handlers/contracts";
import { handleUzbLang } from "../handlers/uzbek";
import { changeLanguageHandler, getSettingsMenu } from "../handlers/settings";
import { handleRussianLang } from "../handlers/russian";
import { handleBack } from "../handlers/back";

// Start
bot.command("start", handleStart);

bot.callbackQuery("create_contract", handleCreateContract);

// Language
bot.callbackQuery("uzbek", handleUzbLang);
bot.callbackQuery("russian", handleRussianLang);

// Main Keyboard
bot.hears(["⚙ Sozlamalar", "⚙ Настройки"], getSettingsMenu);
bot.hears(["🏠 Asosiy menyu", "🏠 Главное меню"], async (ctx) => {
  await ctx.reply("Asosiy menu!");
});

bot.hears(["🌐 Tilni o'zgartirish", "🌐 Изменить язык"], changeLanguageHandler);

bot.hears(["⬅️ Ortga", "⬅️ Назад"], handleBack);
