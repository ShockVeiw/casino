import mongoose from 'mongoose';
import request from 'supertest';

import app from '../bin/app';
import User from '../modules/users/user.model';
import Session from '../modules/sessions/session.model';

const { ObjectId } = mongoose.Types;

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany({});
  await Session.deleteMany({});
});

describe('Session Integration Tests', () => {
  let userId: string;
  let sessionId: string;

  beforeEach(async () => {
    const user = await User.create({ username: 'SessionTestUser' });
    userId = user._id as string;
  });

  it('should start a new session and roll the slots successfully', async () => {
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    expect(sessionResponse.status).toBe(201);
    expect(sessionResponse.body).toHaveProperty('sessionId');
    sessionId = sessionResponse.body.sessionId;

    const rollResponse = await request(app).post(
      `/api/sessions/${sessionId}/roll`
    );

    expect(rollResponse.status).toBe(200);
    expect(rollResponse.body).toHaveProperty('result');
    expect(rollResponse.body.creditsAfterRoll).toBeLessThanOrEqual(10);
  });

  it('should not allow starting a session for a non-existent user', async () => {
    const invalidUserId = new ObjectId();

    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId: invalidUserId });

    expect(sessionResponse.status).toBe(404);
    expect(sessionResponse.body.message).toBe('User not found.');
  });

  it('should not allow rolling with insufficient credits', async () => {
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    sessionId = sessionResponse.body.sessionId;
    await Session.findByIdAndUpdate(sessionId, { credits: 0 });

    const rollResponse = await request(app).post(
      `/api/sessions/${sessionId}/roll`
    );

    expect(rollResponse.status).toBe(400);
    expect(rollResponse.body.message).toBe('Not enough credits to roll.');
  });

  it('should cash out successfully', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(1);
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    sessionId = sessionResponse.body.sessionId;
    await request(app).post(`/api/sessions/${sessionId}/roll`);

    const cashOutResponse = await request(app).post(
      `/api/sessions/${sessionId}/cashout`
    );

    expect(cashOutResponse.status).toBe(200);
    expect(cashOutResponse.body).toEqual({
      success: true,
      message: 'Cash-out successful.',
      totalCreditsCashedOut: expect.any(Number),
    });
  });

  it('should not allow multiple cash-outs in quick succession', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(1);
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    sessionId = sessionResponse.body.sessionId;

    await request(app).post(`/api/sessions/${sessionId}/roll`);
    await request(app).post(`/api/sessions/${sessionId}/cashout`);

    const secondCashOutResponse = await request(app).post(
      `/api/sessions/${sessionId}/cashout`
    );

    expect(secondCashOutResponse.status).toBe(404); // Expect session to be ended
    expect(secondCashOutResponse.body.message).toBe('Session not found.');
  });

  it('should log actions correctly', async () => {
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    sessionId = sessionResponse.body.sessionId;

    await request(app).post(`/api/sessions/${sessionId}/roll`);
    await request(app).post(`/api/sessions/${sessionId}/cashout`);
  });
});
