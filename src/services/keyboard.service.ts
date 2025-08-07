import { InlineKeyboard } from 'grammy';
import { Language, TranslationService as t } from './translation.service';

export interface KeyboardButton {
  text: string;
  callbackData: string;
}

export interface MenuConfig {
  buttons: KeyboardButton[][];
  language: Language;
}

export class KeyboardService {
  /**
   * Creates a generic inline keyboard from configuration
   */
  static createInlineKeyboard(config: MenuConfig): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    config.buttons.forEach((row, index) => {
      row.forEach((button, buttonIndex) => {
        keyboard.text(button.text, button.callbackData);
        
        // Add row break if not last button in row
        if (buttonIndex === row.length - 1 && index < config.buttons.length - 1) {
          keyboard.row();
        }
      });
    });

    return keyboard;
  }

  /**
   * Creates language selection keyboard
   */
  static createLanguageKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
      .text('🇺🇿 O\'zbekcha', 'language_uz')
      .text('🇷🇺 Русский', 'language_ru');
  }

  /**
   * Creates currency selection keyboard
   */
  static createCurrencyKeyboard(language: Language): InlineKeyboard {
    return new InlineKeyboard()
      .text('💵 USD', 'currency_usd')
      .text('💰 UZS', 'currency_uzs');
  }

  /**
   * Creates yes/no confirmation keyboard
   */
  static createConfirmationKeyboard(
    language: Language, 
    confirmationType: 'income' | 'expense' | 'contract' = 'income'
  ): InlineKeyboard {
    const yes = t.translate('yes', language);
    const no = t.translate('no', language);
    
    return new InlineKeyboard()
      .text(`✅ ${yes}`, `confirmation_${confirmationType}_yes`)
      .text(`❌ ${no}`, `confirmation_${confirmationType}_no`);
  }

  /**
   * Creates main menu keyboard for managers
   */
  static createManagerMainMenuKeyboard(language: Language): InlineKeyboard {
    const config: MenuConfig = {
      language,
      buttons: [
        [
          { text: `🏢 ${t.translate('office', language)}`, callbackData: 'office' },
          { text: `👥 ${t.translate('share', language)}`, callbackData: 'share' }
        ],
        [
          { 
            text: `📝 ${t.translate('createContract', language)}`, 
            callbackData: 'create_contract' 
          },
          { text: `💵 ${t.translate('advance', language)}`, callbackData: 'advance' }
        ],
        [
          { text: `💰 ${t.translate('income', language)}`, callbackData: 'income' },
          { 
            text: `💸 ${t.translate('contractExpense', language)}`, 
            callbackData: 'contract_expense' 
          }
        ],
        [
          { 
            text: `📋 ${t.translate('contracts', language)}`, 
            callbackData: 'contracts_director' 
          }
        ]
      ]
    };

    return this.createInlineKeyboard(config);
  }

  /**
   * Creates main menu keyboard for directors
   */
  static createDirectorMainMenuKeyboard(language: Language): InlineKeyboard {
    const config: MenuConfig = {
      language,
      buttons: [
        [
          { text: `➕ ${t.translate('addIncome', language)}`, callbackData: 'income' },
          { text: `➖ ${t.translate('addExpense', language)}`, callbackData: 'expense' }
        ],
        [
          { text: `💰 ${t.translate('balance', language)}`, callbackData: 'balance' },
          { text: `📋 ${t.translate('contracts', language)}`, callbackData: 'contracts_director' }
        ],
        [
          { text: `⚙️ ${t.translate('settings', language)}`, callbackData: 'settings' }
        ]
      ]
    };

    return this.createInlineKeyboard(config);
  }

  /**
   * Creates main menu keyboard for cashiers
   */
  static createCashierMainMenuKeyboard(language: Language): InlineKeyboard {
    const config: MenuConfig = {
      language,
      buttons: [
        [
          { text: `💰 ${t.translate('balance', language)}`, callbackData: 'balance' },
          { text: `📋 ${t.translate('contracts', language)}`, callbackData: 'contracts_cashier' }
        ],
        [
          { text: `⚙️ ${t.translate('settings', language)}`, callbackData: 'settings' }
        ]
      ]
    };

    return this.createInlineKeyboard(config);
  }

  /**
   * Creates pagination keyboard
   */
  static createPaginationKeyboard(
    currentPage: number,
    totalPages: number,
    language: Language
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    if (currentPage > 0) {
      keyboard.text('◀️', `pagination_prev_${currentPage - 1}`);
    }

    keyboard.text(`${currentPage + 1}/${totalPages}`, 'page_info');

    if (currentPage < totalPages - 1) {
      keyboard.text('▶️', `pagination_next_${currentPage + 1}`);
    }

    return keyboard;
  }

  /**
   * Creates contract action keyboard for approval/rejection
   */
  static createContractActionKeyboard(
    contractId: string,
    language: Language,
    userRole: 'director' | 'cashier'
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    // Different actions based on role
    if (userRole === 'director') {
      keyboard
        .text('✅ Approve', `approve_contract_${contractId}`)
        .text('❌ Reject', `reject_contract_${contractId}`)
        .row()
        .text('🔄 In Progress', `inprogress_contract_${contractId}`);
    } else if (userRole === 'cashier') {
      keyboard
        .text('✅ Approve', `approve_contract_${contractId}`)
        .text('❌ Reject', `reject_contract_${contractId}`);
    }

    keyboard.row().text(t.translate('back', language), 'back_to_contracts');

    return keyboard;
  }

  /**
   * Creates back button keyboard
   */
  static createBackKeyboard(
    language: Language, 
    backAction: string = 'back_to_main'
  ): InlineKeyboard {
    return new InlineKeyboard()
      .text(t.translate('back', language), backAction);
  }

  /**
   * Creates settings keyboard
   */
  static createSettingsKeyboard(language: Language): InlineKeyboard {
    const config: MenuConfig = {
      language,
      buttons: [
        [
          { text: `🌐 ${t.translate('selectLanguage', language)}`, callbackData: 'change_language' }
        ],
        [
          { text: t.translate('back', language), callbackData: 'back_to_main' }
        ]
      ]
    };

    return this.createInlineKeyboard(config);
  }

  /**
   * Creates a keyboard with phone number request
   */
  static createPhoneRequestKeyboard(language: Language) {
    // Note: This creates a reply keyboard, not inline keyboard
    // Grammy's ReplyKeyboard would be used for this
    return {
      keyboard: [
        [{
          text: language === 'uz' ? '📱 Telefon raqamni yuborish' : '📱 Отправить номер телефона',
          request_contact: true
        }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    };
  }

  /**
   * Helper method to create role-based main menu
   */
  static createMainMenuKeyboard(role: string, language: Language): InlineKeyboard {
    switch (role) {
      case 'director':
        return this.createDirectorMainMenuKeyboard(language);
      case 'cashier':
        return this.createCashierMainMenuKeyboard(language);
      case 'manager':
      case 'responsible':
        return this.createManagerMainMenuKeyboard(language);
      default:
        return this.createDirectorMainMenuKeyboard(language); // Default fallback
    }
  }
}