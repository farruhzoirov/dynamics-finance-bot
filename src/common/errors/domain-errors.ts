import { Language } from '../../services/translation.service';

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  abstract getLocalizedMessage(language: Language): string;
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Maʼlumotlar notoʻgʻri' : 'Неверные данные';
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(public readonly userId: number) {
    super(`User with ID ${userId} not found`);
  }

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Foydalanuvchi topilmadi' : 'Пользователь не найден';
  }
}

export class ContractNotFoundError extends DomainError {
  readonly code = 'CONTRACT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(public readonly contractId: string) {
    super(`Contract with ID ${contractId} not found`);
  }

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Shartnoma topilmadi' : 'Договор не найден';
  }
}

export class InsufficientBalanceError extends DomainError {
  readonly code = 'INSUFFICIENT_BALANCE';
  readonly statusCode = 400;

  constructor(
    public readonly requestedAmount: number,
    public readonly availableBalance: number
  ) {
    super(`Insufficient balance. Requested: ${requestedAmount}, Available: ${availableBalance}`);
  }

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Balans yetarli emas' : 'Недостаточно средств';
  }
}

export class CurrencyServiceError extends DomainError {
  readonly code = 'CURRENCY_SERVICE_ERROR';
  readonly statusCode = 503;

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Valyuta kursini olishda xatolik' : 'Ошибка получения курса валют';
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Ruxsat berilmagan' : 'Доступ запрещен';
  }
}

export class InvalidAmountError extends ValidationError {
  constructor(public readonly amount: string) {
    super(`Invalid amount: ${amount}`);
  }

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Notoʻgʻri miqdor kiritildi' : 'Введена неверная сумма';
  }
}

export class DatabaseError extends DomainError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;

  getLocalizedMessage(language: Language): string {
    return language === 'uz' ? 'Maʼlumotlar bazasi xatosi' : 'Ошибка базы данных';
  }
}

// Result pattern for better error handling
export type Result<T, E = DomainError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T>(data: T): Result<T> => ({ success: true, data });

export const failure = <E extends DomainError>(error: E): Result<never, E> => ({ 
  success: false, 
  error 
});

// Helper to create results from promises
export const asyncResult = async <T>(
  promise: Promise<T>
): Promise<Result<T>> => {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    if (error instanceof DomainError) {
      return failure(error);
    }
    // Convert unknown errors to domain errors
    return failure(new DatabaseError('An unexpected error occurred', error as Error));
  }
};