import winston from 'winston';

export interface LogContext {
  userId?: number;
  contractId?: string;
  correlationId?: string;
  action?: string;
  [key: string]: any;
}

class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
          });
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Add file transports in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      );

      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      );
    }
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...context
    });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // Bot-specific logging methods
  userAction(action: string, userId: number, additionalContext?: LogContext): void {
    this.info(`User action: ${action}`, {
      action,
      userId,
      ...additionalContext
    });
  }

  transactionCreated(
    type: 'income' | 'expense',
    amount: number,
    currency: string,
    userId: number,
    context?: LogContext
  ): void {
    this.info('Transaction created', {
      action: 'transaction_created',
      type,
      amount,
      currency,
      userId,
      ...context
    });
  }

  contractAction(
    action: string,
    contractId: string,
    userId: number,
    context?: LogContext
  ): void {
    this.info(`Contract action: ${action}`, {
      action: `contract_${action}`,
      contractId,
      userId,
      ...context
    });
  }

  currencyRatesFetched(rates: { buyValue: number; saleValue: number }): void {
    this.info('Currency rates fetched successfully', {
      action: 'currency_rates_fetched',
      rates
    });
  }

  botStarted(): void {
    this.info('Bot started successfully', {
      action: 'bot_started',
      timestamp: new Date().toISOString()
    });
  }

  databaseConnected(): void {
    this.info('Connected to MongoDB successfully', {
      action: 'database_connected'
    });
  }
}

// Singleton instance
export const logger = new LoggerService();

// Helper function to generate correlation IDs for request tracking
export const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};