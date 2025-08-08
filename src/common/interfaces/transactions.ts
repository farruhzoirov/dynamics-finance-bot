export interface ITransaction {
  sheetName?: string;
  contractId?: number | string;
  type: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  description: string;
  createdBy: string;
}
