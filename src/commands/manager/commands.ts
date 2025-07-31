import { InlineKeyboard, NextFunction } from 'grammy';
import { bot, MyContext } from '../../bot';
import { handleCommonExpenseRequestConfirmation } from '../../handlers/manager/confirm-common-expense-request';
import { handleContractBasedExpense } from '../../handlers/manager/contract-expense';
import { UserStepModel } from '../../models/user-step.model';
import { validateAndParseAmount } from '../../validators/amount.validator';
import { CommonExpenseModel } from '../../models/common-expenses.model';
import {
  handleCommonExpenseCurrency,
  handleCommonExpensesRequest
} from '../../handlers/manager/common-expenses-request';
import { Expenses } from '../../common/enums/expense-type.enum';
import { Languages } from '../../common/types/languages';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { handleContractRequestCancellation } from '../../handlers/manager/cancel-contract-request';

bot.callbackQuery('contract_expense', handleContractBasedExpense);

bot.callbackQuery(
  [
    'office',
    'share',
    'advance',
    'income',
    'expense_purchase',
    'expense_logistics',
    'expense_certificates',
    'expense_other',
    'expense_bonus',
    'expense_manager_share'
  ],
  handleCommonExpensesRequest
);

bot.callbackQuery(
  ['common_expense_uzs', 'common_expense_usd'],
  handleCommonExpenseCurrency
);
bot.callbackQuery(
  ['common_expense_confirm_yes', 'common_expense_confirm_no'],
  handleCommonExpenseRequestConfirmation
);

bot.callbackQuery(
  /^common_expense_confirm_yes:([^:]+):([^:]+)$/,
  handleCommonExpenseRequestConfirmation
);

bot.callbackQuery(
  /^common_expense_confirm_no:([^:]+):([^:]+)$/,
  handleContractRequestCancellation
);

bot.on('message:text', async (ctx: MyContext, next: NextFunction) => {
  const userId = ctx.from!.id;
  let userActions = await UserStepModel.findOne({ userId: userId });

  if (!userActions) return;

  if (userActions.step === 'ask_common_expense_amount') {
    const amountText = ctx.message!.text;
    const amount = validateAndParseAmount(amountText as string);
    if (!amount) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? "❌ Iltimos, qiymatni faqat musbat sonlarda va to'g'ri formatda kiriting."
          : '❌ Пожалуйста, вводите только положительные числа в правильном формате.'
      );
      return;
    }
    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_common_expense_currency',
          data: {
            ...userActions?.data,
            commonExpenseAmount: amount
          }
        }
      },
      { upsert: true, new: true }
    );

    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_common_expense_currency',
          data: {
            ...userActions?.data,
            commonExpenseAmount: amount
          }
        }
      },
      { upsert: true, new: true }
    );
    return await ctx.reply(
      userActions!.data.language === 'uz'
        ? 'Valyutani tanlang:'
        : 'Выберите валюту:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  userActions!.data.language === 'uz'
                    ? "So'm (UZS)"
                    : 'Сум (UZS)',
                callback_data: 'common_expense_uzs'
              },
              {
                text:
                  userActions!.data.language === 'uz'
                    ? 'Dollar (USD)'
                    : 'Доллар (USD)',
                callback_data: 'common_expense_usd'
              }
            ]
          ]
        }
      }
    );
  }

  if (userActions.step === 'ask_common_expense_description') {
    const description = ctx.message?.text;

    await ctx.reply(
      userActions?.data?.language === 'uz'
        ? "Iltimos Managerning to'liq F.I.SH sini  kiriting :"
        : 'Пожалуйста, введите полные Ф.И.О. менеджера :'
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'common_expense_ask_manager_info',
          data: {
            ...userActions?.data,
            commonExpenseDescription: description
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions.step === 'common_expense_ask_manager_info') {
    const managerInfo = ctx.message?.text;

    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'confirm_common_expense',
          data: {
            ...userActions?.data,
            managerInfo: managerInfo
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'confirm_common_expense') {
    let uniqueId = 1;
    const findCommonExpenseType = await CommonExpenseModel.findOne({
      expenseType: userActions.data.expenseType
    }).sort({ createdAt: -1 });

    if (findCommonExpenseType) {
      uniqueId = findCommonExpenseType.uniqueId + 1;
    }
    const confirmIncomeKeyboard = new InlineKeyboard()
      .text(
        userActions.data.language === 'uz' ? 'Ha' : 'Да',
        `common_expense_confirm_yes:${uniqueId}:${userActions.data?.expenseType}`
      )
      .text(
        userActions.data.language === 'uz' ? "Yo'q" : 'Нет',
        `common_expense_confirm_no:${uniqueId}:${userActions.data?.expenseType}`
      );

    const {
      commonExpenseAmount,
      commonExpenseCurrency,
      commonExpenseDescription,
      managerInfo,
      language
    } = userActions.data;

    const expenseTypeLabel = getExpenseTypeLabel(
      userActions.data.expenseType as Expenses,
      userActions.data.language as Languages
    );

    const text =
      userActions.data.language === 'uz'
        ? `✅ *Ma'lumotlar qabul qilindi!*\n\n*📄 Tavsif:* ${commonExpenseDescription}\n*💵 Miqdor:* ${formatAmountByCurrency(commonExpenseAmount, commonExpenseCurrency, userActions.data.language)} \n*🏷 Chiqim turi:* ${expenseTypeLabel}\n*👤 Manager:* ${managerInfo}\n\nTasdiqlaysizmi?`
        : `✅ *Данные получены!*\n\n*📄 Описание:* ${commonExpenseDescription}\n*💵 Сумма:* ${formatAmountByCurrency(commonExpenseAmount, commonExpenseCurrency, userActions.data.language)} \n*🏷 Тип расхода:* ${expenseTypeLabel}\n*👤 Менеджер:* ${managerInfo}\n\nХотите подтвердить?`;

    const commonExpenseConfirmationMessage = await ctx.reply(text, {
      reply_markup: confirmIncomeKeyboard,
      parse_mode: 'Markdown'
    });

    userActions.data.commonExpenseConfirmationMessageId =
      commonExpenseConfirmationMessage.message_id;
    userActions.markModified('data');
    await userActions.save();
  }

  await next();
});
