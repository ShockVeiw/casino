import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  startSession,
  rollSession,
  cashOutSession,
  getSessionStatus,
} from '../modules/sessions/session.controller';
import { controllerWrapper } from '../common/errors';

const rollLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 rolls per windowMs
  message: {
    status: 429,
    message: 'Too many rolls from this IP, please try again later.',
  },
});

const cashOutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 cash-outs per windowMs
  message: {
    status: 429,
    message: 'Too many cash-out attempts from this IP, please try again later.',
  },
});

const router = Router();

router.post('/', controllerWrapper(startSession));
router.post('/:sessionId/roll', rollLimiter, controllerWrapper(rollSession));
router.post(
  '/:sessionId/cashout',
  cashOutLimiter,
  controllerWrapper(cashOutSession)
);
router.get('/:sessionId', controllerWrapper(getSessionStatus));

export default router;
