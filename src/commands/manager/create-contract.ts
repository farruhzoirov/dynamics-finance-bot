import { InlineKeyboard } from 'grammy';
import { bot } from '../../bot';
import { handleContractCreation } from '../../handlers/manager/create-contract';
import { handleContractCurreny } from '../../handlers/manager/currency';
import { getCurrency } from '../../helpers/get-currency';
import { ContractModel } from '../../models/contract.model';
import { UserStepModel } from '../../models/user-step.model';
import { isValidDateFormat } from '../../validators/date.validator';
import { handleContractRequestConfirmation } from '../../handlers/manager/confirm-contract-request';
import { handleContractRequestCancellation } from '../../handlers/manager/cancel-contract-request';
import { validateAndParseAmount } from '../../validators/amount.validator';
import { validateContractId } from '../../validators/contract-id.validator';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { getCurrencyRates } from '../../services/get-currency.service';
import { Currency } from '../../common/enums/currency.enum';

bot.callbackQuery('create_contract', handleContractCreation);
bot.callbackQuery(['contract_usd', 'contract_uzs'], handleContractCurreny);
bot.callbackQuery(
  /^confirm_contract_request:(.+)$/,
  handleContractRequestConfirmation
);

bot.callbackQuery(
  /^cancel_contract_request:(.+)$/,
  handleContractRequestCancellation
);

bot.on('message:text', async (ctx) => {
  const text = ctx?.message?.text;
  const userId = ctx?.from?.id;
  let userActions = await UserStepModel.findOne({ userId: userId });

  if (!userActions) return;

  if (userActions.step === 'ask_contract_id') {
    const contractId = validateContractId(text);
    if (!contractId) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? "❌ Iltimos, qiymatni faqat musbat sonlarda va to'g'ri formatda kiriting."
          : '❌ Пожалуйста, вводите только положительные числа в правильном формате.'
      );
      return;
    }

    const isExistsContract = await ContractModel.findOne({
      contractId: contractId
    });

    if (isExistsContract) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? '❌ Bunday raqamli shartnoma allaqachon mavjud.'
          : '❌ Договор с данным номером уже существует.'
      );
      return;
    }

    await ctx.reply(
      userActions?.data?.language === 'uz'
        ? 'Iltimos, shartnoma bo‘yicha summani kiriting:'
        : 'Пожалуйста, введите сумму по договору:'
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_contract_amount',
          data: {
            ...userActions?.data,
            contractId: contractId
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'ask_contract_amount') {
    const amountText = ctx!.message!.text!;
    const contractAmount = validateAndParseAmount(amountText);
    if (!contractAmount || contractAmount < 0) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? "❌ Iltimos, qiymatni faqat musbat sonlarda va to'g'ri formatda kiriting."
          : '❌ Пожалуйста, вводите только положительные числа в правильном формате.'
      );
      return;
    }

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_contract_currency',
          data: {
            ...userActions?.data,
            contractAmount: contractAmount
          }
        }
      },
      { upsert: true, new: true }
    );

    return await ctx.reply(
      userActions?.data.language === 'uz'
        ? 'Valyutani tanlang:'
        : 'Выберите валюту:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  userActions?.data.language === 'uz'
                    ? "So'm (UZS)"
                    : 'Сум (UZS)',
                callback_data: 'contract_uzs'
              },
              {
                text:
                  userActions?.data.language === 'uz'
                    ? 'Dollar (USD)'
                    : 'Доллар (USD)',
                callback_data: 'contract_usd'
              }
            ]
          ]
        }
      }
    );
  }

  if (userActions?.step === 'ask_contract_date') {
    const contractDate = ctx?.message?.text;
    const isValidDate = isValidDateFormat(contractDate);

    if (!isValidDate) {
      await ctx.reply(
        userActions.data.language === 'uz'
          ? '❌ Iltimos, shartnoma tuzilgan sanani DD.MM.YYYY mana shu formatda kiriting. Masalan: (01.01.2025)'
          : '❌ Пожалуйста, введите дату заключения договора в формате ДД.ММ.ГГГГ. Например: (01.01.2025)'
      );
      return;
    }

    await ctx.reply(
      userActions?.data?.language === 'uz'
        ? "Iltimos vergul bilan ajratib Managerning to'liq F.I.SH sini va shartnoma tuzilayotgan kompaniya yoki firma nomini kiriting :"
        : 'Пожалуйста, через запятую введите полное Ф.И.О. менеджера и название компании или фирмы, с которой заключается договор:'
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_manager_info',
          data: {
            ...userActions?.data,
            contractDate: contractDate
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'ask_manager_info') {
    const managerInfo = ctx.message.text;

    if (typeof managerInfo !== 'string') {
      await ctx.reply(
        userActions?.data?.language === 'uz'
          ? 'Tavsif noto‘g‘ri formatda. Iltimos, matn kiriting.'
          : 'Описание в неверном формате. Пожалуйста, введите текст.'
      );
      return;
    }

    await ctx.reply(
      userActions?.data.language === 'uz'
        ? 'Shartnoma predmetini kiriting :'
        : '"Введите предмет договора":'
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_contract_description',
          data: {
            ...userActions?.data,
            info: managerInfo
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'ask_contract_description') {
    const description = ctx?.message?.text;

    if (typeof description !== 'string') {
      await ctx.reply(
        userActions?.data?.language === 'uz'
          ? 'Tavsif noto‘g‘ri formatda. Iltimos, matn kiriting.'
          : 'Описание в неверном формате. Пожалуйста, введите текст.'
      );
      return;
    }

    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: 'ask_contract_confirmation',
          data: {
            ...userActions?.data,
            description: description
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  if (userActions?.step === 'ask_contract_confirmation') {
    let uniqueId: number;
    const [contractsCount, latestContract, currencyRates] = await Promise.all([
      ContractModel.countDocuments(),
      ContractModel.findOne().sort({ createdAt: -1 }),
      getCurrencyRates()
    ]);

    if (!currencyRates) return await ctx.reply('Error in getCurrencyRates');

    if (!contractsCount || !latestContract) {
      uniqueId = 1;
    } else {
      uniqueId = latestContract.uniqueId + 1;
    }

    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          data: {
            ...userActions?.data,
            uniqueId: uniqueId
          }
        }
      },
      { upsert: true, new: true }
    );

    if (!userActions) return;

    const confirmKeyboard = new InlineKeyboard()
      .text(
        userActions.data.language === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить',
        `confirm_contract_request:${userActions.data.contractId}`
      )
      .text(
        userActions.data.language === 'uz' ? '❌ Bekor qilish' : '❌ Отменить',
        `cancel_contract_request:${userActions.data.contractId}`
      );

    const confirmationMessage = await ctx.reply(
      userActions.data.language === 'uz'
        ? `📋 *Quyidagi ma'lumotlarni tasdiqlang:*\n  
*🆔 Unikal ID:* ${uniqueId}
*📄 Shartnoma raqami:* ${userActions.data.contractId}
*💰 Shartnoma summasi:* ${formatAmountByCurrency(userActions.data.contractAmount, userActions.data.currency, userActions.data.language)}
*💱 Valyuta:* ${userActions.data.currency}
*🔁 Ayirboshlash kursi:* ${formatAmountByCurrency(currencyRates.buyValue, Currency.UZS, userActions.data.language)}
*📅 Shartnoma sanasi:* ${userActions.data.contractDate}
*👤 Manager haqida ma'lumot:* ${userActions.data.info}
*📝Shartnoma predmeti:* ${userActions.data.description}

Iltimos, ma'lumotlar to‘g‘riligini tasdiqlang.`
        : `📋 *Пожалуйста, подтвердите следующие данные:*\n
*🆔 Уникальный ID:* ${uniqueId}
*📄 Номер договора:* ${userActions.data.contractId}
*💰 Сумма договора:* ${formatAmountByCurrency(userActions.data.contractAmount, userActions.data.currency, userActions.data.language)}
*💱 Валюта:* ${userActions.data.currency}
*🔁 Курс обмена:* ${formatAmountByCurrency(currencyRates.buyValue, Currency.UZS, userActions.data.language)}
*📅 Дата договора:* ${userActions.data.contractDate}
*👤 Информация о менеджере:* ${userActions.data.info}
*📝 Предмет договора:* ${userActions.data.description}

Пожалуйста, подтвердите правильность данных.`,
      {
        reply_markup: confirmKeyboard,
        parse_mode: 'Markdown'
      }
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          data: {
            ...userActions?.data,
            managerConfirmationMessageId: confirmationMessage.message_id
          }
        }
      },
      { upsert: true }
    );
  }
});
