import { Document } from 'mongoose';

export enum SessionStatus {
  Active = 'active',
  Ended = 'ended',
}

export interface ISession extends Document {
  userId: string;
  credits: number;
  status: SessionStatus;
}
