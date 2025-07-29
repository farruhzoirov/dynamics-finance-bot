import { InlineKeyboard, NextFunction } from 'grammy';
import { bot, MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';
import {
  handleIncomeConfirmation,
  handleIncomeConversation,
  handleIncomeCurrency
} from '../../handlers/director/income';
import {
  handleExpense,
  handleExpenseConfirmation,
  handleExpenseCurrency
} from '../../handlers/director/expense';
import { getBalanceHandler } from '../../handlers/balance';
import { handleInProgressContractConfirmation } from '../../handlers/director/in-progress.contract';
import { handleContractRejection } from '../../handlers/director/reject.contract';
import { handleContractApproval } from '../../handlers/director/approve.contract';

// For income
bot.callbackQuery('add_income', handleIncomeConversation);
bot.callbackQuery(['income_uzs', 'income_usd'], handleIncomeCurrency);
bot.callbackQuery(
  ['income_confirm_yes', 'income_confirm_no'],
  handleIncomeConfirmation
);

// For expense
bot.callbackQuery('expense_director', handleExpense);
bot.callbackQuery(['expense_uzs', 'expense_usd'], handleExpenseCurrency);
bot.callbackQuery(
  ['expense_confirm_yes', 'expense_confirm_no'],
  handleExpenseConfirmation
);

bot.callbackQuery(
  /^director_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^director_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^director_reject:(.+)$/, handleContractRejection);

bot.callbackQuery('balance', getBalanceHandler);
bot.callbackQuery('contracts_director');

bot.on('message:text', async (ctx: MyContext, next: NextFunction) => {
  const userId = ctx!.from!.id as number;
  let userActions = await UserStepModel.findOne({ userId: userId });

  if (userActions?.step === 'ask_amount_income') {
    const amountText = ctx!.message!.text!.replace(/[\s.,-]/g, '');
    const amount = parseInt(amountText);
    if (isNaN(amount) || amount < 0) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? '❌ Iltimos, qiymatni faqat musbat sonlarda kiriting.'
          : '❌ Пожалуйста, вводите только положительные числа.'
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
    const amountText = ctx!.message!.text!.replace(/[\s.,-]/g, '');
    const amount = parseInt(amountText);
    if (isNaN(amount) || amount < 0) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? '❌ Iltimos, qiymatni faqat musbat sonlarda kiriting.'
          : '❌ Пожалуйста, вводите только положительные числа.'
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
