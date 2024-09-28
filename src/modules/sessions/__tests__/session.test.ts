import { isValidObjectId, Types as MongooseTypes } from 'mongoose';

import * as userService from '../../users/user.service';
import * as sessionService from '../session.service';
import Session from '../session.model';
import { SessionStatus } from '../../../common/types';
import {
  CashOutFailedError,
  SessionNotFoundError,
} from '../../../common/errors';

const { ObjectId } = MongooseTypes;

jest.mock('../session.model', () => ({
  create: jest.fn().mockImplementation((data) => ({
    _id: new ObjectId(),
    ...data,
  })),
  findById: jest.fn(),
}));
jest.mock('../../users/user.service', () => ({
  updateById: jest.fn(),
}));

describe('Session Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start a new session', async () => {
    const userId = '123';

    const result = await sessionService.startSession(userId);
    expect(isValidObjectId(result.sessionId)).toBeTruthy();
    expect(result.credits).toEqual(10);
  });

  it('should roll the slots', async () => {
    const initialCredits = 10;
    const sessionSaveMock = jest.fn();
    jest.spyOn(sessionService, 'rollSlots').mockImplementation(() => ({
      result: ['cherry', 'cherry', 'cherry'],
      isWinningRoll: true,
      reward: 10,
    }));

    const sessionId = 'session1';
    const sessionData = {
      _id: sessionId,
      credits: initialCredits,
      status: SessionStatus.Active,
      save: sessionSaveMock,
    };
    (Session.findById as jest.Mock).mockResolvedValue(sessionData);

    const result = await sessionService.rollSession(sessionId);
    expect(result).toHaveProperty('result');
    expect(sessionSaveMock).toHaveBeenCalledTimes(1);
    expect(result.creditsAfterRoll).toBe(initialCredits + 10 - 1);
  });

  it('should throw an error if session not found when rolling', async () => {
    const sessionId = 'invalidId';
    (Session.findById as jest.Mock).mockResolvedValue(null);

    await expect(sessionService.rollSession(sessionId)).rejects.toThrow(
      SessionNotFoundError
    );
  });

  it('should cash out the session', async () => {
    const sessionSaveMock = jest.fn();
    const sessionId = 'session1';
    const sessionData = {
      _id: sessionId,
      userId: 'user1',
      credits: 10,
      status: SessionStatus.Active,
      save: sessionSaveMock,
    };
    jest.spyOn(Math, 'random').mockReturnValue(1);
    (Session.findById as jest.Mock).mockResolvedValue(sessionData);

    const result = await sessionService.cashOutSession(sessionId);
    expect(result).toEqual({
      success: true,
      message: 'Cash-out successful.',
      totalCreditsCashedOut: 10,
    });
    expect(userService.updateById).toHaveBeenCalledTimes(1);
    expect(sessionSaveMock).toHaveBeenCalledTimes(1);
    expect(sessionData.status).toBe(SessionStatus.Ended);
  });

  it('should throw an error on cash out failure', async () => {
    const sessionId = 'session1';
    const sessionData = {
      _id: sessionId,
      credits: 10,
      status: SessionStatus.Active,
    };
    (Session.findById as jest.Mock).mockResolvedValue(sessionData);
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    await expect(sessionService.cashOutSession(sessionId)).rejects.toThrow(
      CashOutFailedError
    );
  });

  it('should get session status', async () => {
    const sessionId = 'session1';
    const sessionData = {
      _id: sessionId,
      credits: 10,
      status: SessionStatus.Active,
    };
    (Session.findById as jest.Mock).mockResolvedValue(sessionData);

    const result = await sessionService.getSessionStatus(sessionId);
    expect(result).toEqual({
      sessionId: sessionData._id,
      credits: sessionData.credits,
      status: sessionData.status,
    });
  });

  it('should throw an error if session not found', async () => {
    const sessionId = 'invalidId';
    (Session.findById as jest.Mock).mockResolvedValue(null);

    await expect(sessionService.getSessionStatus(sessionId)).rejects.toThrow(
      SessionNotFoundError
    );
  });
});
