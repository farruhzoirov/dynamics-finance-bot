export interface CurrencyValidationResult {
  isValid: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

export class FixedCurrencyValidator {
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
   * Detects the format and normalizes the input
   */
  private static normalizeInput(input: string): { normalized: string; hasDecimals: boolean } {
    // Remove currency symbols and extra spaces
    let cleaned = input.replace(/[$сўм]/g, '').trim();
    
    // Detect format by looking for comma and dot positions
    const lastCommaIndex = cleaned.lastIndexOf(',');
    const lastDotIndex = cleaned.lastIndexOf('.');
    
    let normalized = cleaned;
    let hasDecimals = false;
    
    // Case 1: European format with comma as decimal separator
    // Examples: "3 942 040 509,44", "1 234,56", "1234,56"
    if (lastCommaIndex > lastDotIndex && lastCommaIndex > 0) {
      const afterComma = cleaned.substring(lastCommaIndex + 1);
      
      // If there are 1-3 digits after comma, treat as decimal separator
      if (afterComma.length <= 3 && /^\d+$/.test(afterComma)) {
        // Remove spaces and replace comma with dot
        normalized = cleaned.replace(/\s/g, '').replace(',', '.');
        hasDecimals = true;
      }
    }
    // Case 2: US format with dot as decimal separator  
    // Examples: "3,942,040,509.44", "1,234.56", "1234.56"
    else if (lastDotIndex > lastCommaIndex && lastDotIndex > 0) {
      const afterDot = cleaned.substring(lastDotIndex + 1);
      
      // If there are 1-3 digits after dot, treat as decimal separator
      if (afterDot.length <= 3 && /^\d+$/.test(afterDot)) {
        // Remove spaces and commas (thousands separators)
        normalized = cleaned.replace(/[\s,]/g, '');
        hasDecimals = true;
      }
    }
    // Case 3: No decimal separator, just remove spaces and commas
    else {
      normalized = cleaned.replace(/[\s,]/g, '');
      hasDecimals = false;
    }
    
    return { normalized, hasDecimals };
  }

  /**
   * Validates currency input with proper European/US format handling
   */
  static validateAmount(input: string, currencyType: 'USD' | 'UZS'): CurrencyValidationResult {
    const rules = this.CURRENCY_RULES[currencyType];
    
    try {
      // Step 1: Basic validation
      if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Amount is required' };
      }

      // Step 2: Normalize input (handle European vs US format)
      const { normalized, hasDecimals } = this.normalizeInput(input);
      
      if (normalized === '' || normalized === '.') {
        return { isValid: false, error: 'Amount cannot be empty' };
      }

      // Step 3: Validate format
      const formatValidation = this.validateFormat(normalized, rules, hasDecimals);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Step 4: Parse to number
      const numericValue = parseFloat(normalized);
      if (isNaN(numericValue)) {
        return { isValid: false, error: 'Invalid number format' };
      }

      // Step 5: Validate range
      const rangeValidation = this.validateRange(numericValue, rules, currencyType);
      if (!rangeValidation.isValid) {
        return rangeValidation;
      }

      // Step 6: Format result
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
   * Validate the normalized format
   */
  private static validateFormat(
    normalized: string, 
    rules: typeof FixedCurrencyValidator.CURRENCY_RULES.USD,
    hasDecimals: boolean
  ): CurrencyValidationResult {
    // Check for multiple decimal points
    const decimalMatches = normalized.match(/\./g);
    if (decimalMatches && decimalMatches.length > 1) {
      return { isValid: false, error: 'Multiple decimal points are not allowed' };
    }

    // Check for minus signs
    const minusMatches = normalized.match(/-/g);
    if (minusMatches && minusMatches.length > 1) {
      return { isValid: false, error: 'Multiple minus signs are not allowed' };
    }
    if (minusMatches && minusMatches.length === 1 && !normalized.startsWith('-')) {
      return { isValid: false, error: 'Minus sign must be at the beginning' };
    }

    // Check decimal places for currency type
    if (hasDecimals && !rules.allowDecimals) {
      return { isValid: false, error: `${rules.symbol === '$' ? 'USD' : 'UZS'} does not support decimal places` };
    }

    if (hasDecimals && normalized.includes('.')) {
      const decimalPart = normalized.split('.')[1];
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
   * Validate number range
   */
  private static validateRange(
    value: number, 
    rules: typeof FixedCurrencyValidator.CURRENCY_RULES.USD, 
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
    const rounded = Number(amount.toFixed(rules.maxDecimals));
    
    if (currencyType === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(rounded);
    } else {
      const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${formatted} сўм`;
    }
  }

  /**
   * Format for Telegram with bold
   */
  static formatForTelegram(amount: number, currencyType: 'USD' | 'UZS'): string {
    return `*${this.formatAmount(amount, currencyType)}*`;
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
      return Math.round(amount * exchangeRate);
    }
    
    if (fromCurrency === 'UZS' && toCurrency === 'USD') {
      return Number((amount / exchangeRate).toFixed(2));
    }
    
    return amount;
  }
}

// Convenience functions
export const validateUSDFixed = (input: string) => FixedCurrencyValidator.validateAmount(input, 'USD');
export const validateUZSFixed = (input: string) => FixedCurrencyValidator.validateAmount(input, 'UZS');
export const formatUSDFixed = (amount: number) => FixedCurrencyValidator.formatAmount(amount, 'USD');
export const formatUZSFixed = (amount: number) => FixedCurrencyValidator.formatAmount(amount, 'UZS');