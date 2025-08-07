import { CallbackQuery, Message } from 'grammy/types';

// Telegram Callback Data Types
export interface BaseCallbackData {
  action: string;
}

export interface CurrencyCallbackData extends BaseCallbackData {
  action: 'currency';
  currency: 'usd' | 'uzs';
}

export interface ConfirmationCallbackData extends BaseCallbackData {
  action: 'confirmation';
  type: 'income' | 'expense' | 'contract';
  answer: 'yes' | 'no';
}

export interface ContractCallbackData extends BaseCallbackData {
  action: 'approve' | 'reject' | 'inprogress';
  entityType: 'contract' | 'expense';
  entityId: string;
}

export interface LanguageCallbackData extends BaseCallbackData {
  action: 'language';
  language: 'uz' | 'ru';
}

export interface PaginationCallbackData extends BaseCallbackData {
  action: 'pagination';
  direction: 'next' | 'prev';
  page: number;
}

export type TelegramCallbackData = 
  | CurrencyCallbackData
  | ConfirmationCallbackData
  | ContractCallbackData
  | LanguageCallbackData
  | PaginationCallbackData;

// Parser functions with proper typing
export class CallbackDataParser {
  /**
   * Parses callback data string into typed object
   */
  static parse(data: string): TelegramCallbackData | null {
    const parts = data.split('_');
    if (parts.length === 0) return null;

    const action = parts[0];

    switch (action) {
      case 'currency':
        return this.parseCurrencyData(parts);
      case 'confirmation':
        return this.parseConfirmationData(parts);
      case 'approve':
      case 'reject':
      case 'inprogress':
        return this.parseContractData(parts);
      case 'language':
        return this.parseLanguageData(parts);
      case 'pagination':
        return this.parsePaginationData(parts);
      default:
        return null;
    }
  }

  private static parseCurrencyData(parts: string[]): CurrencyCallbackData | null {
    if (parts.length < 2) return null;
    
    const currency = parts[1].toLowerCase();
    if (currency !== 'usd' && currency !== 'uzs') return null;

    return {
      action: 'currency',
      currency: currency as 'usd' | 'uzs'
    };
  }

  private static parseConfirmationData(parts: string[]): ConfirmationCallbackData | null {
    if (parts.length < 3) return null;

    const type = parts[1];
    const answer = parts[2];

    if (!['income', 'expense', 'contract'].includes(type)) return null;
    if (!['yes', 'no'].includes(answer)) return null;

    return {
      action: 'confirmation',
      type: type as 'income' | 'expense' | 'contract',
      answer: answer as 'yes' | 'no'
    };
  }

  private static parseContractData(parts: string[]): ContractCallbackData | null {
    if (parts.length < 3) return null;

    const action = parts[0];
    const entityType = parts[1];
    const entityId = parts[2];

    if (!['approve', 'reject', 'inprogress'].includes(action)) return null;
    if (!['contract', 'expense'].includes(entityType)) return null;
    if (!entityId) return null;

    return {
      action: action as 'approve' | 'reject' | 'inprogress',
      entityType: entityType as 'contract' | 'expense',
      entityId
    };
  }

  private static parseLanguageData(parts: string[]): LanguageCallbackData | null {
    if (parts.length < 2) return null;

    const language = parts[1].toLowerCase();
    if (language !== 'uz' && language !== 'ru') return null;

    return {
      action: 'language',
      language: language as 'uz' | 'ru'
    };
  }

  private static parsePaginationData(parts: string[]): PaginationCallbackData | null {
    if (parts.length < 3) return null;

    const direction = parts[1];
    const page = parseInt(parts[2], 10);

    if (!['next', 'prev'].includes(direction)) return null;
    if (isNaN(page) || page < 0) return null;

    return {
      action: 'pagination',
      direction: direction as 'next' | 'prev',
      page
    };
  }

  /**
   * Type guards for callback data
   */
  static isCurrencyData(data: TelegramCallbackData): data is CurrencyCallbackData {
    return data.action === 'currency';
  }

  static isConfirmationData(data: TelegramCallbackData): data is ConfirmationCallbackData {
    return data.action === 'confirmation';
  }

  static isContractData(data: TelegramCallbackData): data is ContractCallbackData {
    return ['approve', 'reject', 'inprogress'].includes(data.action);
  }

  static isLanguageData(data: TelegramCallbackData): data is LanguageCallbackData {
    return data.action === 'language';
  }

  static isPaginationData(data: TelegramCallbackData): data is PaginationCallbackData {
    return data.action === 'pagination';
  }
}

// Type guards for Telegram API objects
export function hasCallbackQuery(ctx: any): ctx is { callbackQuery: CallbackQuery } {
  return ctx && ctx.callbackQuery;
}

export function hasMessage(ctx: any): ctx is { message: Message } {
  return ctx && ctx.message;
}

export function hasText(message: Message): message is Message.TextMessage {
  return 'text' in message && typeof message.text === 'string';
}

export function hasContact(message: Message): message is Message.ContactMessage {
  return 'contact' in message && message.contact !== undefined;
}

// Helper function to safely get callback data
export function getCallbackData(ctx: any): TelegramCallbackData | null {
  if (!hasCallbackQuery(ctx) || !ctx.callbackQuery.data) {
    return null;
  }

  return CallbackDataParser.parse(ctx.callbackQuery.data);
}

// Helper function to safely get message text
export function getMessageText(ctx: any): string | null {
  if (!hasMessage(ctx) || !hasText(ctx.message)) {
    return null;
  }

  return ctx.message.text;
}

// Helper function to safely get user contact
export function getUserContact(ctx: any): { phone_number: string; first_name: string } | null {
  if (!hasMessage(ctx) || !hasContact(ctx.message)) {
    return null;
  }

  return ctx.message.contact;
}