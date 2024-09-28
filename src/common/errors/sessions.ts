import { produceCustomError } from '.';

export const SessionNotFoundError = produceCustomError(
  404,
  'Session not found.'
);

export const NotEnoughCreditsError = produceCustomError(
  400,
  'Not enough credits to roll.'
);

export const CashOutFailedError = produceCustomError(
  400,
  'Failed to cash out session.'
);
