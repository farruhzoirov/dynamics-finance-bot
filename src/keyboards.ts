import { InlineKeyboard } from "grammy";
import { UserRoles } from "./common/enums/roles.enum";

export function getMainMenuKeyboard(userRole: string, userActions: any) {
  const keyboard = new InlineKeyboard();

  if (userRole === UserRoles.manager) {
    keyboard
      .text(
        userActions.data?.language === "uz" ? "🏢 Office" : "🏢 Офис",
        "office",
      )
      .text(
        userActions.data?.language === "uz" ? "👥 Ulush" : "👥 Доля",
        "share",
      )
      .row()
      .text(
        `📝 ${
          userActions.data?.language === "uz"
            ? "Shartnoma yaratish"
            : "Создать договор"
        }`,
        "create_contract",
      )
      .text(
        userActions.data?.language === "uz" ? "💵 Avans" : "💵 Аванс",
        "advance",
      )
      .row()
      .text(
        userActions.data?.language === "uz" ? "💰 Kirim" : "💰 Приход",
        "income",
      )
      .text(
        userActions.data?.language === "uz"
          ? "💸 Shartnoma bo'yicha xarajat"
          : "💸 Расход по договору",
        "contract_expense",
      )
      .row();
  }

  if (userRole === UserRoles.director) {
    keyboard
      .text(
        userActions.data?.language === "uz"
          ? "➕ Kirim qo'shish"
          : "➕ Добавить приход",
        "add_income",
      )
      .text(
        userActions.data?.language === "uz" ? "💸 Chiqim" : "💸 Расход",
        "expense",
      )
      .row()
      .text(
        userActions.data?.language === "uz" ? "💳 Balans" : "💳 Баланс",
        "balance",
      )
      .text(
        userActions.data?.language === "uz" ? "📋 Shartnomalar" : "📋 Договори",
        "contracts",
      )
      .row();
  }

  return keyboard;
}

export function getStagesKeyboard(stages: any[], contractId: string) {
  const keyboard = new InlineKeyboard();

  stages.forEach((stage, index) => {
    const status = stage.completed ? "✅" : "⏳";
    keyboard
      .text(
        `${status} ${index + 1}. ${stage.stageName}`,
        `stage_${contractId}_${index}`,
      )
      .row();
  });

  keyboard.text("🔙 Orqaga", "back_to_menu");
  return keyboard;
}
