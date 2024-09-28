import { Router } from 'express';
import logsRouter from './logs';
import usersRouter from './users';
import sessionsRouter from './sessions';

const router = Router();
router.use('/logs', logsRouter);
router.use('/users', usersRouter);
router.use('/sessions', sessionsRouter);

export default router;
