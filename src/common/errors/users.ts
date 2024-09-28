import { produceCustomError } from '.';

export const UserNotFoundError = produceCustomError(404, 'User not found.');
export const UsernameRequiredError = produceCustomError(
  400,
  'Username is required.'
);
export const UsernameTakenError = produceCustomError(
  400,
  'Username is already taken.'
);
