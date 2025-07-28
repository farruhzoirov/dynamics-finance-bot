import { Schema, model } from 'mongoose';
import { ContractStatuses } from '../common/enums/contract-status.enum';

const DirectorActionSchema = new Schema(
  {
    contractId: { type: Number },
    messageId: { type: Number },
    action: { type: String, enum: ContractStatuses },
    actionDate: { type: Date },
    directorId: { type: Number },
    directorName: { type: String }
  },
  {
    timestamps: true
  }
);

export const DirectorActionModel = model(
  'directoraction',
  DirectorActionSchema
);

DirectorActionSchema.index({ directorId: 1 });
