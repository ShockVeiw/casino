import express from 'express';

import { getList } from '../modules/logs/log.controller';
import { controllerWrapper } from '../common/errors';

const router = express.Router();

router.get('/', controllerWrapper(getList));

export default router;
