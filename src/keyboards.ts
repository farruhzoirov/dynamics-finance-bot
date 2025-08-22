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
    .row()
    .text(
      userActions.data?.language === 'uz' ? '📋 Shartnomalar' : '📋 Договори',
      'contracts_director'
    )
    .text(userActions.data?.language === 'uz' ? '💰 Qarz' : '💰 Долг', 'debt')
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
      'expense'
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
    .row()
    .text(
      userActions.data?.language === 'uz'
        ? '💳 Tranzaksiyalar tarixi'
        : '💳 История транзакций',
      'tx_all_1'
    );

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
      userActions.data?.language === 'uz' ? '🏢 Office' : '🏢 Офис',
      'office'
    )
    .text(userActions.data?.language === 'uz' ? '👥 Ulush' : '👥 Доля', 'share')
    .row()
    .text(
      userActions.data?.language === 'uz' ? '💵 Avans' : '💵 Аванс',
      'advance'
    )
    .text(
      userActions.data.language === 'uz' ? '💸 Chiqim' : '💸 Расход',
      'expense'
    )
    .row()
    .text(
      userActions.data?.language === 'uz'
        ? '💳 Tranzaksiyalar tarixi'
        : '💳 История транзакций',
      'tx_all_1'
    )
    .text(
      userActions.data?.language === 'uz'
        ? "💸 Shartnoma bo'yicha xarajat"
        : '💸 Расход по договору',
      'contract_expense'
    )
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
      userActions.data?.language === 'uz' ? '📋 Shartnomalar' : '📋 Договори',
      'contracts_director'
    )
    .row()
    .text(userActions.data?.language === 'uz' ? '💰 Qarz' : '💰 Долг', 'debt');
  return keyboard;
}

export function getForContractExpenseKeyboardForManager(userActions: any) {
  const isUz = userActions.data.language === 'uz';

  const keyboard = new InlineKeyboard()
    .text(
      isUz ? '🛒 Tovar xaridi uchun' : '🛒 Для покупки товара',
      'expense_purchase'
    )
    .text(
      isUz ? '🚚 Tovar logistikasi' : '🚚 Логистика товара',
      'expense_logistics'
    )
    .row()
    .text(isUz ? '📄 Sertifikatlar' : '📄 Сертификаты', 'expense_certificates')
    .text(isUz ? '📦 Boshqa xarajatlar' : '📦 Прочие расходы', 'expense_other')
    .row()
    .text(
      isUz ? '🎁 Mijoz uchun bonus' : '🎁 Бонус для клиента',
      'expense_bonus'
    )
    .text(
      isUz ? '🤝 Meneger ulushi' : '🤝 Доля менеджера',
      'expense_manager_share'
    )
    .row();

  return keyboard;
}
