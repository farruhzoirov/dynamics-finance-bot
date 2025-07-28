export interface IContract {
  uniqueId: number;
  contractId: number;
  contractAmount: number;
  currency: string;
  exchangeRate: number;
  contractDate: string;
  info: string;
  description: string;
  status: string;
  managerUserId?: number;
  managerConfirmationMessageId?: number;
}
