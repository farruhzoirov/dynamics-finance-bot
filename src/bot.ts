import {
  Bot,
  type Context,
  GrammyError,
  HttpError,
  type SessionFlavor
} from 'grammy';
import { configEnv } from './config/config-env';
import { SessionData } from './types';
import { connectToDatabase } from './db/database';
import { CurrencyService } from './services/get-currency.service';
import { logger } from './services/logger.service';
import { DomainError } from './common/errors/domain-errors';

export type MyContext = Context & SessionFlavor<SessionData>;

export const bot = new Bot<MyContext>(configEnv.TELEGRAM_BOT_TOKEN);

// Import command handlers
import './commands/index';

/**
 * Global error handler with structured logging
 */
bot.catch((err) => {
  const ctx = err.ctx;
  const error = err.error;
  
  logger.error(`Error while handling update ${ctx.update.update_id}`, error, {
    updateId: ctx.update.update_id,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
    errorType: error.constructor.name
  });

  if (error instanceof GrammyError) {
    logger.error('Grammy API error', error, {
      errorCode: error.error_code,
      description: error.description
    });
  } else if (error instanceof HttpError) {
    logger.error('HTTP error communicating with Telegram', error, {
      statusCode: error.error?.status
    });
  } else if (error instanceof DomainError) {
    logger.error('Domain error', error, {
      errorCode: error.code,
      statusCode: error.statusCode
    });
  } else {
    logger.error('Unknown error', error);
  }
});

/**
 * Bot startup with proper error handling and validation
 */
const startBot = async (): Promise<void> => {
  try {
    // Connect to database
    await connectToDatabase();
    logger.databaseConnected();

    // Validate currency service
    const currencyRatesResult = await CurrencyService.getValidatedCurrencyRates();
    if (!currencyRatesResult.success) {
      logger.error('Failed to fetch currency rates on startup', currencyRatesResult.error);
      throw new Error("Can't get currency rates - bot startup failed");
    }

    logger.info('Currency rates validated successfully', {
      rates: currencyRatesResult.data
    });

    // Start bot
    await bot.start();
    logger.botStarted();

    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      await bot.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start bot', error as Error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', reason as Error, {
    promise: promise.toString()
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Start the bot
startBot();
