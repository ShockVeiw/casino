import request from 'supertest';

import app from '../bin/app';
import User from '../modules/users/user.model';
import Session from '../modules/sessions/session.model';

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany({});
  await Session.deleteMany({});
});

describe('Rate Limiting Integration Tests', () => {
  let userId: string;
  let sessionId: string;

  beforeEach(async () => {
    const user = await User.create({ username: 'RateLimitTestUser' });
    userId = user._id as string;

    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    sessionId = sessionResponse.body.sessionId;
  });

  it('should enforce rate limiting on roll endpoint', async () => {
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(request(app).post(`/api/sessions/${sessionId}/roll`));
    }
    await Promise.all(requests);

    const response = await request(app).post(`/api/sessions/${sessionId}/roll`);
    expect(response.status).toBe(429);
    expect(response.body.message).toBe(
      'Too many rolls from this IP, please try again later.'
    );
  });

  it('should enforce rate limiting on cash-out endpoint', async () => {
    await request(app).post(`/api/sessions/${sessionId}/roll`);

    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(request(app).post(`/api/sessions/${sessionId}/cashout`));
    }

    await Promise.all(requests);

    const response = await request(app).post(
      `/api/sessions/${sessionId}/cashout`
    );
    expect(response.status).toBe(429);
    expect(response.body.message).toBe(
      'Too many cash-out attempts from this IP, please try again later.'
    );
  });
});
