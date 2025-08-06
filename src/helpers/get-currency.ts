import axios from 'axios';

export async function getCurrency(): Promise<number> {
  try {
    const currencyApiResponse = await axios.get(
      `https://cbu.uz/uz/arkhiv-kursov-valyut/json/`
    );

    return currencyApiResponse.data[0].Rate;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
