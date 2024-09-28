import { isValidObjectId, Types as MongooseTypes, UpdateQuery } from 'mongoose';

import User from './user.model';
import { IUser } from '../../common/types';
import { UsernameTakenError } from '../../common/errors';

export const getLeaderboard = async (limit: number = 10) => {
  const leaderboard = await User.find({}, 'username totalCredits')
    .sort({ totalCredits: -1 })
    .limit(limit)
    .lean();

  return leaderboard;
};

export const createUser = async (username: string) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new UsernameTakenError();
  }

  return User.create({ username });
};

export const findUserById = async (userId: MongooseTypes.ObjectId | string) => {
  if (!isValidObjectId(userId)) {
    return null;
  }

  return User.findById(userId);
};

export const updateById = async (
  userId: string,
  data: UpdateQuery<IUser>,
  returnUpdated = false
) => {
  if (!isValidObjectId(userId)) {
    return null;
  }

  return User.findByIdAndUpdate(userId, data, { new: returnUpdated });
};
