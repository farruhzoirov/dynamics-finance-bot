import { InlineKeyboard } from 'grammy';

export function getMainMenuKeyboardForManager(userActions: any) {
  const keyboard = new InlineKeyboard();

  keyboard
    .text(
      userActions.data?.language === 'uz' ? '🏢 Office' : '🏢 Офис',
      'office'
    )
    .text(userActions.data?.language === 'uz' ? '👥 Ulush' : '👥 Доля', 'share')
    .row()
    .text(
      `📝 ${
        userActions.data?.language === 'uz'
          ? 'Shartnoma yaratish'
          : 'Создать договор'
      }`,
      'create_contract'
    )
    .text(
      userActions.data?.language === 'uz' ? '💵 Avans' : '💵 Аванс',
      'advance'
    )
    .row()
    .text(
      userActions.data?.language === 'uz' ? '💰 Kirim' : '💰 Приход',
      'income'
    )
    .text(
      userActions.data?.language === 'uz'
        ? "💸 Shartnoma bo'yicha xarajat"
        : '💸 Расход по договору',
      'contract_expense'
    )
    .row();

  return keyboard;
}

export function getMainMenuKeyboardForDirector(userActions: any) {
  const keyboard = new InlineKeyboard();
  keyboard
    .text(
      userActions.data?.language === 'uz'
        ? "➕ Kirim qo'shish"
        : '➕ Добавить приход',
      'add_income'
    )
    .text(
      userActions.data?.language === 'uz' ? '💸 Chiqim' : '💸 Расход',
      'expense_director'
    )
    .row()
    .text(
      userActions.data?.language === 'uz' ? '💳 Balans' : '💳 Баланс',
      'balance'
    )
    .text(
      userActions.data?.language === 'uz' ? '📋 Shartnomalar' : '📋 Договори',
      'contracts_director'
    )
    .row();
  return keyboard;
}

export function getMainMenuKeyboardForCashier(userActions: any) {
  const keyboard = new InlineKeyboard()
    .text(
      userActions.data.language === 'uz'
        ? "➕ Kirim qo'shish"
        : '➕ Добавить приход',
      'add_income'
    )
    .text(
      userActions.data.language === 'uz'
        ? '🔒 Shartnoma yopish'
        : '🔒 Закрыть договор',
      'close_contract'
    )
    .row()
    .text(
      userActions.data.language === 'uz' ? '💸 Chiqim' : '💸 Расход',
      'expense'
    )
    .row();
  return keyboard;
}
