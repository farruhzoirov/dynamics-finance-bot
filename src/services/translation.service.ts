export type Language = 'uz' | 'ru';

interface TranslationMap {
  [key: string]: {
    uz: string;
    ru: string;
  };
}

const translations: TranslationMap = {
  // Common actions
  yes: { uz: 'Ha', ru: 'Да' },
  no: { uz: "Yo'q", ru: 'Нет' },
  cancel: { uz: 'Bekor qilish', ru: 'Отменить' },
  cancelled: { uz: 'Bekor qilindi', ru: 'Отменено' },
  confirm: { uz: 'Tasdiqlash', ru: 'Подтвердить' },
  back: { uz: 'Orqaga', ru: 'Назад' },
  
  // Menu items
  income: { uz: 'Kirim', ru: 'Приход' },
  expense: { uz: 'Chiqim', ru: 'Расход' },
  balance: { uz: 'Balans', ru: 'Баланс' },
  contracts: { uz: 'Shartnomalar', ru: 'Договори' },
  settings: { uz: 'Sozlamalar', ru: 'Настройки' },
  
  // Messages
  enterAmount: { uz: 'Miqdorni kiriting:', ru: 'Введите сумму:' },
  enterIncomeAmount: { uz: 'Iltimos, kirim miqdorini kiriting:', ru: 'Пожалуйста, введите сумму дохода:' },
  enterExpenseAmount: { uz: 'Iltimos, chiqim miqdorini kiriting:', ru: 'Пожалуйста, Введите сумму вывода::' },
  enterDescription: { uz: 'Izoh kiriting :', ru: 'Введите описание :' },
  dataSavedSuccessfully: { uz: "Ma'lumotlar muvaffaqiyatli saqlandi. ✅", ru: 'Данные успешно сохранены. ✅' },
  
  // Errors
  errorGeneral: { uz: 'Xatolik yuz berdi', ru: 'Произошла ошибка' },
  errorCurrency: { uz: 'Valyuta kursini olishda xatolik', ru: 'Ошибка получения курса валют' },
  contractNotFound: { uz: "Shartnoma topilmadi", ru: "Договор не найден" },
  userNotFound: { uz: "Foydalanuvchi topilmadi", ru: "Пользователь не найден" },
  
  // Status messages
  directorApproved: { uz: 'Direktor tasdiqlagan', ru: 'Директор одобрил' },
  cashierApproved: { uz: 'Kassir tasdiqlagan', ru: 'Кассир одобрил' },
  sentToCashier: { uz: 'Kassirga yuborildi', ru: 'Отправлено кассиру' },
  
  // Role-based menu items
  createContract: { uz: 'Shartnoma yaratish', ru: 'Создать договор' },
  advance: { uz: 'Avans', ru: 'Аванс' },
  contractExpense: { uz: "Shartnoma bo'yicha xarajat", ru: 'Расход по договору' },
  office: { uz: 'Office', ru: 'Офис' },
  share: { uz: 'Ulush', ru: 'Доля' },
  addIncome: { uz: "Kirim qo'shish", ru: 'Добавить доход' },
  addExpense: { uz: "Chiqim qo'shish", ru: 'Добавить расход' },
  
  // Language selection
  selectLanguage: { uz: 'Tilni tanlang', ru: 'Выберите язык' },
  phoneRequest: { uz: 'Iltimos, telefon raqamingizni yuboring:', ru: 'Пожалуйста, отправьте свой номер телефона:' },
  registeredSuccessfully: { uz: "Muvaffaqiyatli ro'yxatdan o'tdingiz /start", ru: 'Успешно зарегистрированы /start' },
  
  // Validation messages
  invalidAmount: { uz: 'Noto\'g\'ri miqdor kiritildi', ru: 'Введена неверная сумма' },
  insufficientBalance: { uz: 'Balans yetarli emas', ru: 'Недостаточно средств' },
  
  // Contract stages
  contractSigning: { uz: 'Shartnoma imzolash', ru: 'Подписание договора' },
  productPurchase: { uz: 'Tovar sotib olish', ru: 'Покупка товара' },
  logistics: { uz: 'Tovar logistikasi', ru: 'Логистика товара' },
  certification: { uz: 'Sertifikatlashtirish', ru: 'Сертификация' },
  otherExpenses: { uz: 'Boshqa xarajatlar', ru: 'Прочие расходы' },
  customerBonus: { uz: 'Mijoz bonusi', ru: 'Бонус клиента' },
  managerShare: { uz: 'Menejer ulushi', ru: 'Доля менеджера' }
};

export class TranslationService {
  static translate(key: string, language: Language): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key "${key}" not found`);
      return key; // Return key as fallback
    }
    return translation[language];
  }

  static getTranslations(keys: string[], language: Language): Record<string, string> {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = this.translate(key, language);
    });
    return result;
  }

  // Helper method for common yes/no buttons
  static getYesNoButtons(language: Language) {
    return {
      yes: this.translate('yes', language),
      no: this.translate('no', language)
    };
  }

  // Helper method for confirm/cancel buttons
  static getConfirmCancelButtons(language: Language) {
    return {
      confirm: this.translate('confirm', language),
      cancel: this.translate('cancel', language)
    };
  }
}

// Export helper function for easy use
export const t = (key: string, language: Language): string => 
  TranslationService.translate(key, language);