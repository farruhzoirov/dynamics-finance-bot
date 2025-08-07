import axios from 'axios';
import * as cheerio from 'cheerio';
import { 
  Result, 
  success, 
  failure, 
  CurrencyServiceError 
} from '../common/errors/domain-errors';
import { logger } from './logger.service';

export interface CurrencyRates {
  buyValue: number;
  saleValue: number;
}

export class CurrencyService {
  private static readonly CURRENCY_URL = 'https://kapitalbank.uz/uz/services/exchange-rates/';
  private static readonly REQUEST_TIMEOUT = 10000;
  private static readonly TABLE_SELECTOR = '.table-table-bordered-table-striped';

  private static readonly REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'uz-UZ,uz;q=0.9,en;q=0.8,ru;q=0.7'
  };

  /**
   * Fetches current USD exchange rates from Kapital Bank
   */
  static async getCurrencyRates(): Promise<Result<CurrencyRates>> {
    try {
      logger.info('Fetching currency rates', { url: this.CURRENCY_URL });

      const response = await axios.get(this.CURRENCY_URL, {
        headers: this.REQUEST_HEADERS,
        timeout: this.REQUEST_TIMEOUT
      });

      const $ = cheerio.load(response.data);
      const table = $(this.TABLE_SELECTOR);

      if (!table.length) {
        logger.warn('Currency table not found on page', { 
          selector: this.TABLE_SELECTOR,
          url: this.CURRENCY_URL 
        });
        return failure(new CurrencyServiceError());
      }

      let currencies: CurrencyRates | null = null;

      table.find('tbody tr').each((index, row) => {
        const cells = $(row).find('td');
        // USD is typically in the second row (index 1)
        if (index === 1) {
          const buyValue = parseFloat($(cells[2]).text().trim());
          const saleValue = parseFloat($(cells[3]).text().trim());

          if (isNaN(buyValue) || isNaN(saleValue)) {
            logger.warn('Invalid currency values found', { buyValue, saleValue });
            return;
          }

          currencies = { buyValue, saleValue };
          return false; // Break the each loop
        }
      });

      if (!currencies) {
        logger.warn('No valid currency data found');
        return failure(new CurrencyServiceError());
      }

      logger.currencyRatesFetched(currencies);
      return success(currencies);

    } catch (error) {
      logger.error('Failed to fetch currency rates', error as Error, { 
        url: this.CURRENCY_URL 
      });
      return failure(new CurrencyServiceError());
    }
  }

  /**
   * Validates if currency rates are reasonable (basic sanity check)
   */
  static validateRates(rates: CurrencyRates): boolean {
    return (
      rates.buyValue > 0 && 
      rates.saleValue > 0 &&
      rates.buyValue < rates.saleValue && // Buy rate should be lower than sell rate
      rates.buyValue > 1000 && // Reasonable lower bound for UZS/USD
      rates.saleValue < 50000 // Reasonable upper bound for UZS/USD
    );
  }

  /**
   * Gets currency rates with validation
   */
  static async getValidatedCurrencyRates(): Promise<Result<CurrencyRates>> {
    const ratesResult = await this.getCurrencyRates();
    
    if (!ratesResult.success) {
      return ratesResult;
    }

    if (!this.validateRates(ratesResult.data)) {
      logger.warn('Currency rates failed validation', { rates: ratesResult.data });
      return failure(new CurrencyServiceError());
    }

    return ratesResult;
  }
}

// Legacy function for backward compatibility
export async function getCurrencyRates(): Promise<CurrencyRates | false> {
  const result = await CurrencyService.getCurrencyRates();
  return result.success ? result.data : false;
}
