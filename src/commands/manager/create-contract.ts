import { InlineKeyboard } from "grammy";
import { bot } from "../../bot";
import { handleContractCreation } from "../../handlers/manager/create-contract";
import { handleContractCurreny } from "../../handlers/manager/currency";
import { getCurrency } from "../../helpers/get-currency";
import { ContractModel } from "../../models/contract.model";
import { UserStepModel } from "../../models/user-step.model";
import { isValidDateFormat } from "../../validators/date.validator";
import { handleContractConfirmation } from "../../handlers/manager/confirm-contract";

bot.callbackQuery("create_contract", handleContractCreation);
bot.callbackQuery(["contract_usd", "contract_uzs"], handleContractCurreny);
bot.callbackQuery("confirm_contract_request", handleContractConfirmation);

bot.on("message:text", async (ctx) => {
  const text = ctx?.message?.text;
  const userId = ctx?.from?.id;
  let userActions = await UserStepModel.findOne({ userId: userId });

  if (!userActions) return;

  if (userActions.step === "ask_contract_id") {
    const contractId = parseInt(text);

    if (isNaN(contractId)) {
      await ctx.reply(
        userActions?.data.language === "uz"
          ? "❌ Iltimos, qiymatni faqat sonlarda kiriting."
          : "❌ Пожалуйста, введите значение только цифрами.",
      );
      return;
    }

    await ctx.reply(
      userActions?.data?.language === "uz"
        ? "Iltimos, shartnoma bo‘yicha summani kiriting:"
        : "Пожалуйста, введите сумму по договору:",
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_contract_amount",
          data: {
            ...userActions?.data,
            contractId: contractId,
          },
        },
      },
      { upsert: true, new: true },
    );
  }

  if (userActions?.step === "ask_contract_amount") {
    const contractAmountText = ctx?.message?.text;
    const contractAmount = parseFloat(contractAmountText);

    if (isNaN(contractAmount)) {
      await ctx.reply(
        userActions?.data.language === "uz"
          ? "❌ Iltimos, qiymatni faqat sonlarda kiriting."
          : "❌ Пожалуйста, введите значение только цифрами.",
      );
      return;
    }

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_contract_currency",
          data: {
            ...userActions?.data,
            contractAmount: contractAmount,
          },
        },
      },
      { upsert: true, new: true },
    );

    return await ctx.reply(
      userActions?.data.language === "uz"
        ? "Valyutani tanlang:"
        : "Выберите валюту:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  userActions?.data.language === "uz"
                    ? "So'm (UZS)"
                    : "Сум (UZS)",
                callback_data: "contract_uzs",
              },
              {
                text:
                  userActions?.data.language === "uz"
                    ? "Dollar (USD)"
                    : "Доллар (USD)",
                callback_data: "contract_usd",
              },
            ],
          ],
        },
      },
    );
  }

  if (userActions?.step === "ask_contract_date") {
    const contractDate = ctx?.message?.text;
    const isValidDate = isValidDateFormat(contractDate);

    if (!isValidDate) {
      await ctx.reply(
        userActions.data.language === "uz"
          ? "❌ Iltimos, shartnoma tuzilgan sanani DD.MM.YYYY mana shu formatda kiriting. Masalan: (01.01.2025)"
          : "❌ Пожалуйста, введите дату заключения договора в формате ДД.ММ.ГГГГ. Например: (01.01.2025)",
      );
      return;
    }

    await ctx.reply(
      userActions?.data?.language === "uz"
        ? "Iltimos Managerning to'liq F.I.SH sini kiriting :"
        : "Пожалуйста, введите полное Ф.И.О. менеджера:",
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_manager_info",
          data: {
            ...userActions?.data,
            contractDate: contractDate,
          },
        },
      },
      { upsert: true, new: true },
    );
  }

  if (userActions?.step === "ask_manager_info") {
    const managerInfo = ctx.message.text;

    if (typeof managerInfo !== "string") {
      await ctx.reply(
        userActions?.data?.language === "uz"
          ? "Tavsif noto‘g‘ri formatda. Iltimos, matn kiriting."
          : "Описание в неверном формате. Пожалуйста, введите текст.",
      );
      return;
    }

    await ctx.reply(
      userActions?.data.language === "uz"
        ? "Izoh kiriting :"
        : "Введите описание :",
    );

    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_contract_description",
          data: {
            ...userActions?.data,
            managerInfo: managerInfo,
          },
        },
      },
      { upsert: true, new: true },
    );
  }

  if (userActions?.step === "ask_contract_description") {
    const description = ctx?.message?.text;

    if (typeof description !== "string") {
      await ctx.reply(
        userActions?.data?.language === "uz"
          ? "Tavsif noto‘g‘ri formatda. Iltimos, matn kiriting."
          : "Описание в неверном формате. Пожалуйста, введите текст.",
      );
      return;
    }

    userActions = await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_contract_confirmation",
          data: {
            ...userActions?.data,
            description: description,
          },
        },
      },
      { upsert: true, new: true },
    );
  }

  if (userActions?.step === "ask_contract_confirmation") {
    let uniqueId: number;

    const [contractsCount, latestContract, exchangeRate] = await Promise.all([
      ContractModel.countDocuments(),
      ContractModel.findOne().sort({ createdAt: -1 }),
      getCurrency(),
    ]);

    if (!contractsCount || !latestContract) {
      uniqueId = 1;
    } else {
      uniqueId = latestContract.uniqueId + 1;
    }

    const confirmKeyboard = new InlineKeyboard()
      .text(
        userActions.data.language === "uz" ? "✅ Tasdiqlash" : "✅ Подтвердить",
        "confirm_contract_request",
      )
      .text(
        userActions.data.language === "uz" ? "❌ Bekor qilish" : "❌ Отменить",
        "cancel_contract_request",
      );

    await ctx.reply(
      userActions.data.language === "uz"
        ? `📋 Quyidagi ma'lumotlarni tasdiqlang:\n
🆔 Unikal ID: ${uniqueId}
📄 Shartnoma ID: ${userActions.data.contractId}
💰 Shartnoma summasi: ${userActions.data.contractAmount}
💱 Valyuta: ${userActions.data.currency}
🔁 Ayirboshlash kursi: ${exchangeRate}
📅 Shartnoma sanasi: ${userActions.data.contractDate}
👤 Manager haqida ma'lumot: ${userActions.data.managerInfo}
📝 Tavsif: ${userActions.data.description}

Iltimos, ma'lumotlar to‘g‘riligini tasdiqlang.`
        : `📋 Пожалуйста, подтвердите следующие данные:\n
🆔 Уникальный ID: ${uniqueId}
📄 ID контракта: ${userActions.data.contractId}
💰 Сумма контракта: ${userActions.data.contractAmount}
💱 Валюта: ${userActions.data.currency}
🔁 Курс обмена: ${exchangeRate}
📅 Дата контракта: ${userActions.data.contractDate}
👤 Информация о менеджере: ${userActions.data.managerInfo}
📝 Описание: ${userActions.data.description}

Пожалуйста, подтвердите правильность данных.`,
      {
        reply_markup: confirmKeyboard,
      },
    );
  }
});
