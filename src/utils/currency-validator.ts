import currency from 'currency.js';

export interface CurrencyValidationResult {
  isValid: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

export interface CurrencyConfig {
  symbol: string;
  precision: number;
  separator: string;
  decimal: string;
  pattern: string;
}

// Currency configurations
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    symbol: '$',
    precision: 2,
    separator: ',',
    decimal: '.',
    pattern: '$ #'
  },
  UZS: {
    symbol: 'сўм',
    precision: 0, // UZS typically doesn't use decimals
    separator: ' ',
    decimal: '.',
    pattern: '# сўм'
  }
};

export class CurrencyValidator {
  /**
   * Validates and parses currency input
   */
  static validateAmount(input: string, currencyType: 'USD' | 'UZS'): CurrencyValidationResult {
    try {
      // Remove all non-numeric characters except decimal point and minus
      const cleanInput = input.replace(/[^\d.-]/g, '');
      
      if (!cleanInput || cleanInput.trim() === '') {
        return {
          isValid: false,
          error: 'Amount cannot be empty'
        };
      }

      // Check for multiple decimal points
      const decimalCount = (cleanInput.match(/\./g) || []).length;
      if (decimalCount > 1) {
        return {
          isValid: false,
          error: 'Invalid decimal format'
        };
      }

      // Check for multiple minus signs or minus not at start
      const minusCount = (cleanInput.match(/-/g) || []).length;
      if (minusCount > 1 || (minusCount === 1 && !cleanInput.startsWith('-'))) {
        return {
          isValid: false,
          error: 'Invalid negative number format'
        };
      }

      const numericValue = parseFloat(cleanInput);

      // Check if it's a valid number
      if (isNaN(numericValue)) {
        return {
          isValid: false,
          error: 'Invalid number format'
        };
      }

      // Check for negative values (if you don't allow them)
      if (numericValue < 0) {
        return {
          isValid: false,
          error: 'Amount cannot be negative'
        };
      }

      // Check minimum value
      if (numericValue <= 0) {
        return {
          isValid: false,
          error: 'Amount must be greater than zero'
        };
      }

      // Check maximum reasonable values
      const maxValues = {
        USD: 1000000, // $1M max
        UZS: 50000000000 // 50B UZS max
      };

      if (numericValue > maxValues[currencyType]) {
        return {
          isValid: false,
          error: `Amount exceeds maximum allowed (${this.formatAmount(maxValues[currencyType], currencyType)})`
        };
      }

      // Validate decimal places for currency type
      if (currencyType === 'UZS' && cleanInput.includes('.')) {
        return {
          isValid: false,
          error: 'UZS does not support decimal places'
        };
      }

      if (currencyType === 'USD') {
        const decimalPart = cleanInput.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
          return {
            isValid: false,
            error: 'USD supports maximum 2 decimal places'
          };
        }
      }

      return {
        isValid: true,
        value: numericValue,
        formatted: this.formatAmount(numericValue, currencyType)
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Unexpected validation error'
      };
    }
  }

  /**
   * Formats amount according to currency rules
   */
  static formatAmount(amount: number, currencyType: 'USD' | 'UZS'): string {
    const config = CURRENCY_CONFIGS[currencyType];
    
    return currency(amount, {
      symbol: config.symbol,
      precision: config.precision,
      separator: config.separator,
      decimal: config.decimal,
      pattern: config.pattern
    }).format();
  }

  /**
   * Formats for display in Telegram messages
   */
  static formatForTelegram(amount: number, currencyType: 'USD' | 'UZS'): string {
    const formatted = this.formatAmount(amount, currencyType);
    return `*${formatted}*`; // Bold formatting for Telegram
  }

  /**
   * Parse formatted currency back to number
   */
  static parseAmount(formattedAmount: string): number {
    const cleanAmount = formattedAmount.replace(/[^\d.-]/g, '');
    return parseFloat(cleanAmount) || 0;
  }

  /**
   * Convert between currencies (you'll need exchange rate)
   */
  static convertCurrency(
    amount: number, 
    fromCurrency: 'USD' | 'UZS', 
    toCurrency: 'USD' | 'UZS', 
    exchangeRate: number
  ): number {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'USD' && toCurrency === 'UZS') {
      return amount * exchangeRate;
    }
    
    if (fromCurrency === 'UZS' && toCurrency === 'USD') {
      return amount / exchangeRate;
    }
    
    return amount;
  }

  /**
   * Validate currency type
   */
  static isValidCurrencyType(currency: string): currency is 'USD' | 'UZS' {
    return ['USD', 'UZS'].includes(currency);
  }
}

// Helper functions for easy use
export const validateUSD = (input: string) => CurrencyValidator.validateAmount(input, 'USD');
export const validateUZS = (input: string) => CurrencyValidator.validateAmount(input, 'UZS');
export const formatUSD = (amount: number) => CurrencyValidator.formatAmount(amount, 'USD');
export const formatUZS = (amount: number) => CurrencyValidator.formatAmount(amount, 'UZS');