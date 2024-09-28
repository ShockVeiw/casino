import { isValidObjectId, Types as MongooseTypes } from 'mongoose';

import * as userService from '../user.service';
import User from '../user.model';
import { UsernameTakenError } from '../../../common/errors';

const { ObjectId } = MongooseTypes;

jest.mock('../user.model', () => ({
  create: jest.fn().mockImplementation((data) => ({
    _id: new ObjectId(),
    ...data,
  })),
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user if username is unique', async () => {
    const mockUser = { username: 'uniqueUser' };
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const user = await userService.createUser('uniqueUser');

    expect(User.findOne).toHaveBeenCalledWith({ username: 'uniqueUser' });
    expect(isValidObjectId(user._id)).toBeTruthy();
    expect(user.username).toEqual(mockUser.username);
  });

  it('should throw an error if the username already exists', async () => {
    const existingUser = { _id: '123', username: 'existingUser' };
    (User.findOne as jest.Mock).mockResolvedValue(existingUser);

    await expect(userService.createUser('existingUser')).rejects.toThrow(
      UsernameTakenError
    );
  });

  it('should find a user by ID', async () => {
    const mockUser = { _id: new ObjectId(), username: 'someUser' };
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    const user = await userService.findUserById(mockUser._id);

    expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    expect(user).toEqual(mockUser);
  });

  it('should return null if user is not found by ID', async () => {
    const nonExistentUserId = new ObjectId();
    (User.findById as jest.Mock).mockResolvedValue(null);

    const user = await userService.findUserById(nonExistentUserId);

    expect(User.findById).toHaveBeenCalledWith(nonExistentUserId);
    expect(user).toBeNull();
  });
});
