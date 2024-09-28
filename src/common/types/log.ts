import { Document } from 'mongoose';

export enum LogActionEnum {
  SessionStart = 'session_start',
  SessionRoll = 'session_roll',
  SessionCashOut = 'session_cash_out',
}

export interface ILog extends Document {
  userId: string;
  sessionId: string;
  action: LogActionEnum;
  details: string;
}
