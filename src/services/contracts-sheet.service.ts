import axios from 'axios';
import { IApprovalContractPayload } from '../common/interfaces/contract';
import { MyContext } from '../bot';

export async function sendApprovalContractInfoToSheet(
  ctx: MyContext,
  body: IApprovalContractPayload
) {
  try {
    body.sheetName = 'contracts';
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbwt4D9NW9EyWUsCQrbto7jI96Kzh4Nc8zhpOPwZVgbxx30Biw6EMC6nNPO591DWYDVyYQ/exec',
      body
    );
    if (response.data.result === 'success') return true;
  } catch (err) {
    console.error('Error in sendApprovalContractInfoToSheet', err);
    await ctx.reply('Error in sendApprovalContractInfoToSheet');
    return false;
  }
}
