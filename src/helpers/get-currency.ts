import axios from "axios";
import { configEnv } from "../config/config-env";

export async function getCurrency(currency: string): Promise<number> {
  try {
    const currencyApiResponse = await axios.get(
      `https://cbu.uz/uz/arkhiv-kursov-valyut/json/`
      // `https://v6.exchangerate-api.com/v6/${configEnv.CURRENCY_KEY}/latest/${currency}`,
    );

    return currencyApiResponse.data[0].Rate;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
