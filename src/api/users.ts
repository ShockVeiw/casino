import express from 'express';

import {
  getLeaderboardController,
  createUser,
} from '../modules/users/user.controller';
import { controllerWrapper } from '../common/errors';

const router = express.Router();

router.post('/', controllerWrapper(createUser));
router.get('/leaderboard', controllerWrapper(getLeaderboardController));

export default router;
