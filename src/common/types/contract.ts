import { IContract } from '../interfaces/contract';

type RemoveContractBasedFields =
  | 'uniqueId'
  | 'contractId'
  | 'contractAmount'
  | 'currency'
  | 'contractDate'
  | 'info'
  | 'description'
  | 'managerConfirmationMessageId';

export type RemainingContractFields = Omit<
  IContract,
  RemoveContractBasedFields
>;
