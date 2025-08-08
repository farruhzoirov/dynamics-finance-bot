import { bot, MyContext } from '../bot';
import { handleStart } from '../handlers/start';
import { handleUzbLang } from '../handlers/uzbek';
import { changeLanguageHandler, getSettingsMenu } from '../handlers/settings';
import { handleRussianLang } from '../handlers/russian';
import { handleBack } from '../handlers/back';
import { handleMainMenu } from '../handlers/main-menu';
import { InlineKeyboard, NextFunction } from 'grammy';
import { UserStepModel } from '../models/user-step.model';
import { validateAndParseAmount } from '../validators/amount.validator';
import {
  handleIncomeConfirmation,
  handleIncomeConversation,
  handleIncomeCurrency
} from '../handlers/income';
import {
  handleExpense,
  handleExpenseConfirmation,
  handleExpenseCurrency
} from '../handlers/expense';
import { getBalanceHandler } from '../handlers/balance';
import { UserRoles } from '../common/enums/roles.enum';
import { UserModel } from '../models/user.model';
import { handleInitialMenu } from '../handlers/initial';
import { getCurrencyRatesForInitialMenu } from '../handlers/currency';

// Start
bot.command('start', handleStart);
// Balance
bot.command('balance', getBalanceHandler);

//MainMenu
bot.command('main_menu', handleMainMenu);

// Language
bot.callbackQuery('uzbek', handleUzbLang);
bot.callbackQuery('russian', handleRussianLang);

// Main Keyboards
bot.hears(['⚙ Sozlamalar', '⚙ Настройки'], getSettingsMenu);
bot.hears(['🏠 Asosiy menyu', '🏠 Главное меню'], handleMainMenu);
bot.hears(['💳 Balans', '💳 Баланс'], getBalanceHandler);

//  Keyboards inside of Main Keyboards
bot.hears(["🌐 Tilni o'zgartirish", '🌐 Изменить язык'], changeLanguageHandler);
bot.hears(['⬅️ Ortga', '⬅️ Назад'], handleBack);
bot.hears(
  ['💱 Valyuta kursi (USD → UZS)', '💱 Курс валют (USD → UZS)'],
  getCurrencyRatesForInitialMenu
);

// For income
bot.callbackQuery('add_income', handleIncomeConversation);
bot.callbackQuery(['income_uzs', 'income_usd'], handleIncomeCurrency);
bot.callbackQuery(
  ['income_confirm_yes', 'income_confirm_no'],
  handleIncomeConfirmation
);

const AUTHORIZED_PHONES: Record<string, string> = {
  '+998975450409': UserRoles.manager,
  '+998999660913': UserRoles.director,
  '+9989889930206': UserRoles.director,
  '+998910128811': UserRoles.cashier,
  '+79872360420': UserRoles.cashier,
  '+998935847507': UserRoles.manager,
  '+998946564230': UserRoles.manager
} as const;

bot.on('message:contact', async (ctx, next: NextFunction) => {
  const phoneNumber = ctx.message.contact.phone_number;
  if (!phoneNumber || !Object.keys(AUTHORIZED_PHONES).includes(phoneNumber)) {
    await ctx.reply(`Please contact with adminstrator.`);
    return;
  }

  const userId = ctx.from?.id;
  const userName = ctx.from?.username;
  const userFirstName = ctx.from?.first_name;
  const userLastName = ctx.from?.last_name;

  const role = AUTHORIZED_PHONES[phoneNumber as string];

  await Promise.all([
    UserStepModel.create({
      userId,
      step: 'main_menu',
      data: {}
    }),
    UserModel.create({
      userId,
      phone: phoneNumber,
      userName: userName || null,
      userFirstName: userFirstName || null,
      userLastName: userLastName || null,
      role
    })
  ]);
  await ctx.reply('✅ Registered Successfully /start');
  await handleInitialMenu(ctx);
  await next();
});

// For expense
bot.callbackQuery('expense', handleExpense);
bot.callbackQuery(['expense_uzs', 'expense_usd'], handleExpenseCurrency);
bot.callbackQuery(
  ['expense_confirm_yes', 'expense_confirm_no'],
  handleExpenseConfirmation
);

bot.on('message:text', async (ctx: MyContext, next: NextFunction) => {
  const userId = ctx!.from!.id as number;
  let userActions = await UserStepModel.findOne({ userId: userId });

  if (userActions?.step === 'ask_amount_income') {
    const amountText = ctx!.message!.text!;
    const amount = validateAndParseAmount(amountText);
    if (!amount || amount < 0) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? "❌ Iltimos, qiymatni faqat musbat sonlarda va to'g'ri formatda kiriting."
          : '❌ Пожалуйста, вводите только положительные числа в правильном формате.'
      );
      return;
    }

    await UserStepModel.updateOne(
      { userId },
      {
        $set: {
          step: 'ask_currency',
          data: {
            ...userActions?.data,
            amount: amount
          }
        }
      },
      { upsert: true }
    );
    return await ctx.reply(
      userActions.data.language === 'uz'
        ? 'Valyutani tanlang:'
        : 'Выберите валюту:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  userActions.data.language === 'uz'
                    ? "So'm (UZS)"
                    : 'Сум (UZS)',
                callback_data: 'income_uzs'
              },
              {
                text:
                  userActions.data.language === 'uz'
                    ? 'Dollar (USD)'
                    : 'Доллар (USD)',
                callback_data: 'income_usd'
              }
            ]
          ]
        }
      }
    );
  }

  if (userActions?.step === 'ask_description_income') {
    const description = ctx.message?.text;
    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'confirm_income',
          data: {
            ...userActions?.data,
            description: description
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'confirm_income') {
    const confirmIncomeKeyboard = new InlineKeyboard()
      .text(
        userActions.data.language === 'uz' ? 'Ha' : 'Да',
        'income_confirm_yes'
      )
      .text(
        userActions.data.language === 'uz' ? "Yo'q" : 'Нет',
        'income_confirm_no'
      );

    const { amount, currency, description, language } = userActions.data;

    const infoText =
      language === 'uz'
        ? `Ma'lumotlar qabul qilindi. Tasdiqlaysizmi?\n\n📄 Tavsif: ${description}\n💵 Miqdor: ${amount} ${currency}`
        : `Данные получены. Хотите подтвердить?\n\n📄 Описание: ${description}\n💵 Сумма: ${amount} ${currency}`;

    return await ctx.reply(infoText, {
      reply_markup: confirmIncomeKeyboard
    });
  }

  if (userActions?.step === 'ask_amount_expense') {
    const amountText = ctx!.message!.text!;
    const amount = validateAndParseAmount(amountText);
    if (!amount || amount < 0) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? "❌ Iltimos, qiymatni faqat musbat sonlarda va to'g'ri formatda kiriting."
          : '❌ Пожалуйста, вводите только положительные числа в правильном формате.'
      );
      return;
    }
    await UserStepModel.updateOne(
      { userId },
      {
        $set: {
          step: 'ask_currency',
          data: {
            ...userActions?.data,
            amount: amount
          }
        }
      },
      { upsert: true }
    );
    return await ctx.reply(
      userActions.data.language === 'uz'
        ? 'Valyutani tanlang:'
        : 'Выберите валюту:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  userActions.data.language === 'uz'
                    ? "So'm (UZS)"
                    : 'Сум (UZS)',
                callback_data: 'expense_uzs'
              },
              {
                text:
                  userActions.data.language === 'uz'
                    ? 'Dollar (USD)'
                    : 'Доллар (USD)',
                callback_data: 'expense_usd'
              }
            ]
          ]
        }
      }
    );
  }

  if (userActions?.step === 'ask_description_expense') {
    const description = ctx.message?.text;
    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'confirm_expense',
          data: {
            ...userActions?.data,
            description: description
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'confirm_expense') {
    const confirmExpenseKeyboard = new InlineKeyboard()
      .text(
        userActions.data.language === 'uz' ? 'Ha' : 'Да',
        'expense_confirm_yes'
      )
      .text(
        userActions.data.language === 'uz' ? "Yo'q" : 'Нет',
        'expense_confirm_no'
      );

    const { amount, currency, description, language } = userActions.data;

    const infoText =
      language === 'uz'
        ? `Ma'lumotlar qabul qilindi. Tasdiqlaysizmi?\n\n📄 Tavsif: ${description}\n💵 Miqdor: ${amount} ${currency}`
        : `Данные получены. Хотите подтвердить?\n\n📄 Описание: ${description}\n💵 Сумма: ${amount} ${currency}`;

    return await ctx.reply(infoText, {
      reply_markup: confirmExpenseKeyboard
    });
  }

  await next();
});
