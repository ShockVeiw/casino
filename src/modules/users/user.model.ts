import { Schema, model } from 'mongoose';
import { IUser } from '../../common/types';

const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  totalCredits: { type: Number, default: 0 },
});

export default model<IUser>('User', userSchema);
