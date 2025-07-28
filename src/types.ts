export type SessionData = {
  language?: 'uz' | 'ru';
  step?: 'lang' | 'main_menu' | 'create_contract' | 'contract_details';
};

export interface User {
  _id?: string;
  telegramId: number;
  username: string;
  role: 'director' | 'cashier' | 'responsible' | 'customer';
  createdAt: Date;
}

export interface Contract {
  _id?: string;
  number: string;
  name: string;
  amount: number;
  responsiblePersonId: number;
  responsiblePersonUsername: string;
  stages: ContractStage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractStage {
  stageNumber: number;
  stageName: string;
  amount?: number;
  date?: Date;
  description?: string;
  completed: boolean;
}

export interface CashTransaction {
  _id?: string;
  type: 'kirim' | 'chiqim';
  amount: number;
  date: Date;
  contractId?: string;
  description: string;
  createdBy: number;
  createdAt: Date;
}

export interface UserSession {
  step?: string;
  data?: any;
}

export const CONTRACT_STAGES = [
  'Shartnoma imzolash',
  'Tovar sotib olish',
  'Tovar logistikasi',
  'Sertifikatlashtirish',
  'Boshqa xarajatlar',
  'Mijoz bonusi',
  'Menejer ulushi'
];
