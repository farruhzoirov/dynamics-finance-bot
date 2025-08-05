import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getCurrencyRates() {
  try {
    const response = await axios.get(
      'https://kapitalbank.uz/uz/services/exchange-rates/',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uz-UZ,uz;q=0.9,en;q=0.8,ru;q=0.7'
        },
        timeout: 10000
      }
    );
    const $ = cheerio.load(response.data);
    let currencies: { buyValue: number; saleValue: number } = {
      buyValue: 0,
      saleValue: 0
    };

    const table = $('.table-table-bordered-table-striped');

    if (!table.length) {
      console.log('Html Table Not found: getCurrencyRatesWithAxios');
      return false;
    }

    table.find('tbody tr').each((index, row) => {
      const cells = $(row).find('td');
      if (index === 1) {
        currencies = {
          buyValue: +$(cells[2]).text().trim(),
          saleValue: +$(cells[3]).text().trim()
        };
        return false;
      }
    });
    return currencies;
  } catch (error) {
    console.error('Error in getCurrencyRatesWithAxios:', error);
    return false;
  }
}
