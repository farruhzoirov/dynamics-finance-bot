import { MyContext } from '../bot';
import { TransactionModel } from '../models/transaction.model';
import { UserService } from '../services/user.service';
import { CurrencyService } from '../services/get-currency.service';
import { TranslationService, Language } from '../services/translation.service';
import { 
  Result, 
  success, 
  failure, 
  InvalidAmountError,
  CurrencyServiceError,
  DatabaseError 
} from '../common/errors/domain-errors';
import { logger } from '../services/logger.service';
import { 
  getCallbackData, 
  getMessageText,
  CallbackDataParser 
} from '../types/telegram.types';

export type TransactionType = 'income' | 'expense';
export type Currency = 'USD' | 'UZS';

export interface TransactionData {
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  exchangeRate?: number;
}

export abstract class BaseTransactionHandler {
  protected abstract transactionType: TransactionType;

  /**
   * Initiates transaction flow
   */
  async handleTransactionStart(ctx: MyContext): Promise<void> {
    try {
      await ctx.answerCallbackQuery();
      
      const userContextResult = await UserService.getUserContext(ctx);
      if (!userContextResult.success) {
        await this.handleError(ctx, userContextResult.error, 'uz');
        return;
      }

      const { language } = userContextResult.data;

      // Update user step to ask for amount
      const stepName = `ask_amount_${this.transactionType}`;
      await UserService.updateUserStep(
        ctx.from!.id, 
        stepName, 
        { type: this.transactionType }
      );

      const message = this.transactionType === 'income' 
        ? TranslationService.translate('enterIncomeAmount', language)
        : TranslationService.translate('enterExpenseAmount', language);

      await ctx.reply(message);
      
      logger.userAction(
        `${this.transactionType}_flow_started`, 
        ctx.from!.id, 
        { transactionType: this.transactionType }
      );

    } catch (error) {
      logger.error(`Failed to start ${this.transactionType} flow`, error as Error, {
        userId: ctx.from?.id,
        transactionType: this.transactionType
      });
      await ctx.reply('An error occurred. Please try again.');
    }
  }

  /**
   * Handles currency selection
   */
  async handleCurrencySelection(ctx: MyContext): Promise<void> {
    try {
      await ctx.answerCallbackQuery();
      
      const callbackData = getCallbackData(ctx);
      if (!callbackData || !CallbackDataParser.isCurrencyData(callbackData)) {
        logger.warn('Invalid callback data for currency selection', { 
          userId: ctx.from?.id,
          data: ctx.callbackQuery?.data 
        });
        return;
      }

      const currency = callbackData.currency.toUpperCase() as Currency;
      const userId = ctx.from!.id;

      // Delete the currency selection message
      if (ctx.callbackQuery?.message) {
        await ctx.api.deleteMessage(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id
        );
      }

      const userStepResult = await UserService.getUserStep(userId);
      if (!userStepResult.success || !userStepResult.data) {
        logger.error('User step not found during currency selection', undefined, { userId });
        return;
      }

      if (userStepResult.data.step !== 'ask_currency') {
        logger.warn('Invalid step for currency selection', { 
          userId, 
          currentStep: userStepResult.data.step 
        });
        return;
      }

      // Update user step with currency
      await UserService.updateUserStep(
        userId,
        `ask_description_${this.transactionType}`,
        { currency }
      );

      const languageResult = await UserService.getUserLanguage(userId);
      const language = languageResult.success ? languageResult.data : 'uz';

      await ctx.reply(TranslationService.translate('enterDescription', language));

      logger.userAction(`currency_selected_${this.transactionType}`, userId, { currency });

    } catch (error) {
      logger.error('Failed to handle currency selection', error as Error, {
        userId: ctx.from?.id,
        transactionType: this.transactionType
      });
    }
  }

  /**
   * Handles transaction confirmation
   */
  async handleTransactionConfirmation(ctx: MyContext): Promise<void> {
    try {
      await ctx.answerCallbackQuery();
      
      const callbackData = getCallbackData(ctx);
      if (!callbackData || !CallbackDataParser.isConfirmationData(callbackData)) {
        return;
      }

      const { answer } = callbackData;
      const userId = ctx.from!.id;

      // Delete the confirmation message
      if (ctx.callbackQuery?.message) {
        await ctx.api.deleteMessage(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.message.message_id
        );
      }

      const userStepResult = await UserService.getUserStep(userId);
      if (!userStepResult.success || !userStepResult.data) {
        return;
      }

      const languageResult = await UserService.getUserLanguage(userId);
      const language = languageResult.success ? languageResult.data : 'uz';

      if (answer === 'no') {
        await this.handleTransactionCancellation(ctx, language);
        return;
      }

      if (answer === 'yes') {
        await this.processTransaction(ctx, userStepResult.data, language);
      }

    } catch (error) {
      logger.error('Failed to handle transaction confirmation', error as Error, {
        userId: ctx.from?.id,
        transactionType: this.transactionType
      });
      
      // Reset user to main menu on error
      await UserService.resetUserToMainMenu(ctx.from!.id);
      await ctx.reply('An error occurred. Please try again.');
    }
  }

  /**
   * Processes the actual transaction
   */
  protected async processTransaction(
    ctx: MyContext, 
    userStep: any, 
    language: Language
  ): Promise<void> {
    const { type, amount, currency, description } = userStep.data;
    
    // Get currency rates
    const currencyRatesResult = await CurrencyService.getValidatedCurrencyRates();
    if (!currencyRatesResult.success) {
      await this.handleError(ctx, currencyRatesResult.error, language);
      return;
    }

    const exchangeRate = this.transactionType === 'income' 
      ? currencyRatesResult.data.buyValue 
      : currencyRatesResult.data.saleValue;

    // For expenses, check balance if needed
    if (this.transactionType === 'expense') {
      const balanceCheckResult = await this.checkBalance(amount, currency, exchangeRate);
      if (!balanceCheckResult.success) {
        await this.handleError(ctx, balanceCheckResult.error, language);
        return;
      }
    }

    // Create transaction
    const transactionResult = await this.createTransaction({
      type,
      amount,
      currency,
      description,
      exchangeRate
    }, ctx.from!.id);

    if (!transactionResult.success) {
      await this.handleError(ctx, transactionResult.error, language);
      return;
    }

    // Reset user to main menu
    await UserService.resetUserToMainMenu(ctx.from!.id);
    
    await ctx.reply(TranslationService.translate('dataSavedSuccessfully', language));

    logger.transactionCreated(type, amount, currency, ctx.from!.id, {
      transactionId: transactionResult.data._id,
      exchangeRate
    });
  }

  /**
   * Creates transaction in database
   */
  protected async createTransaction(
    transactionData: TransactionData,
    userId: number
  ): Promise<Result<any>> {
    try {
      const userResult = await UserService.getUserById(userId);
      if (!userResult.success) {
        return failure(userResult.error);
      }

      const user = userResult.data;
      const createdBy = `${user.userFirstName || ''} ${user.userLastName || ''}`.trim();

      const transaction = await TransactionModel.create({
        type: transactionData.type,
        amount: transactionData.amount,
        currency: transactionData.currency,
        exchangeRate: transactionData.exchangeRate,
        description: transactionData.description,
        createdBy: createdBy || 'Unknown User'
      });

      return success(transaction);
    } catch (error) {
      return failure(new DatabaseError('Failed to create transaction', error as Error));
    }
  }

  /**
   * Handles transaction cancellation
   */
  protected async handleTransactionCancellation(ctx: MyContext, language: Language): Promise<void> {
    await UserService.resetUserToMainMenu(ctx.from!.id);
    await ctx.reply(TranslationService.translate('cancelled', language));
    
    logger.userAction(`${this.transactionType}_cancelled`, ctx.from!.id);
  }

  /**
   * Checks balance for expense transactions (to be implemented by subclasses if needed)
   */
  protected async checkBalance(
    amount: number, 
    currency: Currency, 
    exchangeRate: number
  ): Promise<Result<void>> {
    // Base implementation - always allow
    // Subclasses can override for balance checking
    return success(undefined);
  }

  /**
   * Handles errors with localized messages
   */
  protected async handleError(ctx: MyContext, error: any, language: Language): Promise<void> {
    const message = error.getLocalizedMessage ? 
      error.getLocalizedMessage(language) : 
      TranslationService.translate('errorGeneral', language);
    
    await ctx.reply(message);
    await UserService.resetUserToMainMenu(ctx.from!.id);
  }

  /**
   * Validates amount input
   */
  static validateAmount(amountStr: string): Result<number> {
    const amount = parseFloat(amountStr.replace(/,/g, '.'));
    
    if (isNaN(amount) || amount <= 0) {
      return failure(new InvalidAmountError(amountStr));
    }

    if (amount > 1000000000) { // 1 billion limit
      return failure(new InvalidAmountError(amountStr));
    }

    return success(amount);
  }
}

/**
 * Income transaction handler
 */
export class IncomeTransactionHandler extends BaseTransactionHandler {
  protected transactionType: TransactionType = 'income';
}

/**
 * Expense transaction handler with balance checking
 */
export class ExpenseTransactionHandler extends BaseTransactionHandler {
  protected transactionType: TransactionType = 'expense';

  protected async checkBalance(
    amount: number, 
    currency: Currency, 
    exchangeRate: number
  ): Promise<Result<void>> {
    // TODO: Implement actual balance checking logic
    // This would involve getting current balance and comparing with requested amount
    // For now, we'll just return success
    return success(undefined);
  }
}

// Export singleton instances
export const incomeHandler = new IncomeTransactionHandler();
export const expenseHandler = new ExpenseTransactionHandler();