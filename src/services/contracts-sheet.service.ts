import axios from 'axios';
import { IApprovalContractPayload } from '../common/interfaces/contract';
import { MyContext } from '../bot';

export async function sendApprovalContractInfoToSheet(
  ctx: MyContext,
  body: IApprovalContractPayload
) {
  try {
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbyw4dVcXgVFf-R6iqfcl4pUT4Kt8uCw7ToL58gCO25xNJFXDnuL-bwdZTFJ-UfaNuDd-g/exec',
      body
    );
    if (response.data.result === 'success') return true;
  } catch (err) {
    console.error('Error in sendApprovalContractInfoToSheet', err);
    await ctx.reply('Error in sendApprovalContractInfoToSheet');
    return false;
  }
}
