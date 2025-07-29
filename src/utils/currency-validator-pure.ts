export interface CurrencyValidationResult {
  isValid: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

export class PureCurrencyValidator {
  private static readonly CURRENCY_RULES = {
    USD: {
      maxDecimals: 2,
      maxValue: 1000000,
      minValue: 0.01,
      allowDecimals: true,
      symbol: '$',
      symbolPosition: 'before' as const
    },
    UZS: {
      maxDecimals: 0,
      maxValue: 50000000000,
      minValue: 1,
      allowDecimals: false,
      symbol: 'сўм',
      symbolPosition: 'after' as const
    }
  };

  /**
   * Validates currency input with comprehensive checks
   */
  static validateAmount(input: string, currencyType: 'USD' | 'UZS'): CurrencyValidationResult {
    const rules = this.CURRENCY_RULES[currencyType];
    
    try {
      // Step 1: Basic input validation
      if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Amount is required' };
      }

      // Step 2: Clean the input (remove currency symbols, spaces, etc.)
      const cleanInput = this.cleanInput(input);
      
      if (cleanInput === '') {
        return { isValid: false, error: 'Amount cannot be empty' };
      }

      // Step 3: Validate format
      const formatValidation = this.validateFormat(cleanInput, rules);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Step 4: Parse to number
      const numericValue = this.parseToNumber(cleanInput);
      if (numericValue === null) {
        return { isValid: false, error: 'Invalid number format' };
      }

      // Step 5: Validate range
      const rangeValidation = this.validateRange(numericValue, rules, currencyType);
      if (!rangeValidation.isValid) {
        return rangeValidation;
      }

      // Step 6: Format the result
      const formatted = this.formatAmount(numericValue, currencyType);

      return {
        isValid: true,
        value: numericValue,
        formatted
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Unexpected validation error'
      };
    }
  }

  /**
   * Clean input by removing unwanted characters
   */
  private static cleanInput(input: string): string {
    // Remove currency symbols, spaces, and other non-numeric chars except . and -
    return input
      .replace(/[$сўм\s,]/g, '') // Remove currency symbols, spaces, commas
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
      .trim();
  }

  /**
   * Validate number format
   */
  private static validateFormat(cleanInput: string, rules: typeof PureCurrencyValidator.CURRENCY_RULES.USD): CurrencyValidationResult {
    // Check for multiple decimal points
    const decimalMatches = cleanInput.match(/\./g);
    if (decimalMatches && decimalMatches.length > 1) {
      return { isValid: false, error: 'Multiple decimal points are not allowed' };
    }

    // Check for multiple minus signs
    const minusMatches = cleanInput.match(/-/g);
    if (minusMatches && minusMatches.length > 1) {
      return { isValid: false, error: 'Multiple minus signs are not allowed' };
    }

    // Check if minus is only at the beginning
    if (minusMatches && minusMatches.length === 1 && !cleanInput.startsWith('-')) {
      return { isValid: false, error: 'Minus sign must be at the beginning' };
    }

    // Check decimal places
    if (cleanInput.includes('.')) {
      if (!rules.allowDecimals) {
        return { isValid: false, error: `${rules.symbol === '$' ? 'USD' : 'UZS'} does not support decimal places` };
      }

      const decimalPart = cleanInput.split('.')[1];
      if (decimalPart && decimalPart.length > rules.maxDecimals) {
        return { 
          isValid: false, 
          error: `Maximum ${rules.maxDecimals} decimal places allowed for ${rules.symbol === '$' ? 'USD' : 'UZS'}` 
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Parse cleaned string to number
   */
  private static parseToNumber(cleanInput: string): number | null {
    const parsed = parseFloat(cleanInput);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Validate number range
   */
  private static validateRange(
    value: number, 
    rules: typeof PureCurrencyValidator.CURRENCY_RULES.USD, 
    currencyType: 'USD' | 'UZS'
  ): CurrencyValidationResult {
    if (value < 0) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }

    if (value < rules.minValue) {
      return { 
        isValid: false, 
        error: `Minimum amount is ${this.formatAmount(rules.minValue, currencyType)}` 
      };
    }

    if (value > rules.maxValue) {
      return { 
        isValid: false, 
        error: `Maximum amount is ${this.formatAmount(rules.maxValue, currencyType)}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Format amount according to currency rules
   */
  static formatAmount(amount: number, currencyType: 'USD' | 'UZS'): string {
    const rules = this.CURRENCY_RULES[currencyType];
    
    // Round to appropriate decimal places
    const rounded = Number(amount.toFixed(rules.maxDecimals));
    
    if (currencyType === 'USD') {
      return this.formatUSD(rounded);
    } else {
      return this.formatUZS(rounded);
    }
  }

  /**
   * Format USD with proper separators
   */
  private static formatUSD(amount: number): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  }

  /**
   * Format UZS with proper separators
   */
  private static formatUZS(amount: number): string {
    // Format number with spaces as thousands separator
    const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} сўм`;
  }

  /**
   * Format for Telegram display (with bold formatting)
   */
  static formatForTelegram(amount: number, currencyType: 'USD' | 'UZS'): string {
    const formatted = this.formatAmount(amount, currencyType);
    return `*${formatted}*`;
  }

  /**
   * Parse formatted currency back to number
   */
  static parseFormattedAmount(formattedAmount: string): number {
    const cleaned = formattedAmount.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Convert between currencies
   */
  static convertCurrency(
    amount: number,
    fromCurrency: 'USD' | 'UZS',
    toCurrency: 'USD' | 'UZS',
    exchangeRate: number
  ): number {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'USD' && toCurrency === 'UZS') {
      return Math.round(amount * exchangeRate); // UZS doesn't use decimals
    }
    
    if (fromCurrency === 'UZS' && toCurrency === 'USD') {
      return Number((amount / exchangeRate).toFixed(2)); // USD uses 2 decimals
    }
    
    return amount;
  }

  /**
   * Get currency info
   */
  static getCurrencyInfo(currencyType: 'USD' | 'UZS') {
    return this.CURRENCY_RULES[currencyType];
  }
}

// Convenience functions
export const validateUSD = (input: string) => PureCurrencyValidator.validateAmount(input, 'USD');
export const validateUZS = (input: string) => PureCurrencyValidator.validateAmount(input, 'UZS');
export const formatUSD = (amount: number) => PureCurrencyValidator.formatAmount(amount, 'USD');
export const formatUZS = (amount: number) => PureCurrencyValidator.formatAmount(amount, 'UZS');