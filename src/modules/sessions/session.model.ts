import { Schema, model } from 'mongoose';
import { ISession, SessionStatus } from '../../common/types';

const sessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  credits: { type: Number, default: 10 },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.Active,
  },
});

export default model<ISession>('Session', sessionSchema);
