import { Request, Response } from 'express';

import * as userService from '../users/user.service';
import * as sessionService from './session.service';
import { UserNotFoundError } from '../../common/errors';

export const startSession = async (req: Request, res: Response) => {
  const { userId } = req.body;

  const user = await userService.findUserById(userId);
  if (!user) {
    throw new UserNotFoundError();
  }

  const sessionData = await sessionService.startSession(userId);
  res.status(201).json(sessionData);
};

export const rollSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const rollData = await sessionService.rollSession(sessionId);
  res.json(rollData);
};

export const cashOutSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const cashOutData = await sessionService.cashOutSession(sessionId);
  res.json(cashOutData);
};

export const getSessionStatus = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const statusData = await sessionService.getSessionStatus(sessionId);
  res.json(statusData);
};
