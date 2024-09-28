import Session from './session.model';
import * as logService from '../logs/log.service';
import * as userService from '../users/user.service';
import { LogActionEnum, SessionStatus } from '../../common/types';
import {
  CashOutFailedError,
  NotEnoughCreditsError,
  SessionNotFoundError,
} from '../../common/errors';

const symbols = ['cherry', 'lemon', 'orange', 'watermelon'];
const rewards = { cherry: 10, lemon: 20, orange: 30, watermelon: 40 };

const getRandomSymbol = (): string =>
  symbols[Math.floor(Math.random() * symbols.length)];

export const rollSlots = () => {
  const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
  const isWinningRoll = result[0] === result[1] && result[1] === result[2];
  let reward = 0;

  if (isWinningRoll) {
    reward = rewards[result[0] as keyof typeof rewards];
  }

  return { result, isWinningRoll, reward };
};

export const startSession = async (userId: string) => {
  const newSession = await Session.create({ userId, credits: 10 });
  await logService.logAction(
    userId,
    newSession._id as string,
    LogActionEnum.SessionStart
  );

  return { sessionId: newSession._id, credits: newSession.credits };
};

export const rollSession = async (sessionId: string) => {
  const session = await Session.findById(sessionId);

  if (!session || session.status === SessionStatus.Ended) {
    throw new SessionNotFoundError();
  }

  if (session.credits < 1) {
    throw new NotEnoughCreditsError();
  }

  session.credits -= 1;
  const { result, isWinningRoll, reward } = rollSlots();

  // House advantage logic
  const shouldReRoll =
    session.credits < 40
      ? false
      : (session.credits <= 60 && Math.random() < 0.3) ||
        (session.credits > 60 && Math.random() < 0.6);

  if (isWinningRoll && shouldReRoll) {
    session.credits += 1;
    const reRollResult = rollSlots();

    const rollSummary = {
      result: reRollResult.result,
      creditsAfterRoll: session.credits,
      reward: reRollResult.reward,
      win: reRollResult.isWinningRoll,
    };

    await logService.logAction(
      session.userId,
      session._id as string,
      LogActionEnum.SessionRoll,
      rollSummary
    );

    return rollSummary;
  }

  if (isWinningRoll) {
    session.credits += reward;
  }

  await session.save();

  const rollSummary = {
    result,
    creditsAfterRoll: session.credits,
    reward,
    win: isWinningRoll,
  };

  await logService.logAction(
    session.userId,
    session._id as string,
    LogActionEnum.SessionRoll,
    rollSummary
  );

  return rollSummary;
};

export const cashOutSession = async (sessionId: string) => {
  const session = await Session.findById(sessionId);

  if (!session || session.status === SessionStatus.Ended) {
    throw new SessionNotFoundError();
  }

  // Simulate cash-out obstacles
  // 50% chance of failure
  if (Math.random() < 0.5) {
    throw new CashOutFailedError();
  }

  await userService.updateById(session.userId, {
    $inc: { totalCredits: session.credits },
  });

  session.status = SessionStatus.Ended;
  await session.save();

  const result = {
    success: true,
    message: 'Cash-out successful.',
    totalCreditsCashedOut: session.credits,
  };

  await logService.logAction(
    session.userId,
    session._id as string,
    LogActionEnum.SessionCashOut,
    result
  );

  return result;
};

export const getSessionStatus = async (sessionId: string) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new SessionNotFoundError();
  }

  return {
    sessionId: session._id,
    credits: session.credits,
    status: session.status,
  };
};
