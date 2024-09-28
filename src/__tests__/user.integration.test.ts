import request from 'supertest';

import app from '../bin/app';
import User from '../modules/users/user.model';
import Session from '../modules/sessions/session.model';

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany({});
  await Session.deleteMany({});
});

describe('User Integration Tests', () => {
  let userId: string;
  let sessionId: string;

  beforeEach(async () => {
    const user = await User.create({ username: 'LeaderboardTestUser' });
    userId = user._id as string;
  });

  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ username: 'NewUser' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('userId');
    expect(response.body.username).toBe('NewUser');
  });

  it('should not create a user with an existing username', async () => {
    await request(app).post('/api/users').send({ username: 'ExistingUser' });

    const response = await request(app)
      .post('/api/users')
      .send({ username: 'ExistingUser' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is already taken.');
  });

  it('should not create a user without a username', async () => {
    const response = await request(app).post('/api/users').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is required.');
  });

  it('should update leaderboard after cashing out', async () => {
    const sessionResponse = await request(app)
      .post('/api/sessions')
      .send({ userId });

    sessionId = sessionResponse.body.sessionId;

    await request(app).post(`/api/sessions/${sessionId}/roll`);
    await request(app).post(`/api/sessions/${sessionId}/cashout`);

    const leaderboardResponse = await request(app).get(
      '/api/users/leaderboard'
    );
    expect(leaderboardResponse.status).toBe(200);
    expect(leaderboardResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: 'LeaderboardTestUser',
          totalCredits: expect.any(Number),
        }),
      ])
    );
  });
});
