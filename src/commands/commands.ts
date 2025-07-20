import { bot } from "../bot";
import { handleStart } from "../handlers/start";
import { handleUzbLang } from "../handlers/uzbek";
import { changeLanguageHandler, getSettingsMenu } from "../handlers/settings";
import { handleRussianLang } from "../handlers/russian";
import { handleBack } from "../handlers/back";
import { handleMainMenu } from "../handlers/main-menu";
import { UserStepModel } from "../models/user-step.model";

// Start
bot.command("start", handleStart);

// Language
bot.callbackQuery("uzbek", handleUzbLang);
bot.callbackQuery("russian", handleRussianLang);

// Main Keyboards
bot.hears(["⚙ Sozlamalar", "⚙ Настройки"], getSettingsMenu);
bot.hears(["🏠 Asosiy menyu", "🏠 Главное меню"], handleMainMenu);

//  Keyboards inside of Main Keyboards
bot.hears(["🌐 Tilni o'zgartirish", "🌐 Изменить язык"], changeLanguageHandler);
bot.hears(["⬅️ Ortga", "⬅️ Назад"], handleBack);
