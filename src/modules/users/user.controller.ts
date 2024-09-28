import { Request, Response } from 'express';

import * as userService from './user.service';
import { UsernameRequiredError } from '../../common/errors';

export const createUser = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    throw new UsernameRequiredError();
  }

  const newUser = await userService.createUser(username);
  res.status(201).json({ userId: newUser._id, username: newUser.username });
};

export const getLeaderboardController = async (req: Request, res: Response) => {
  const leaderboard = await userService.getLeaderboard();
  res.json(leaderboard);
};
