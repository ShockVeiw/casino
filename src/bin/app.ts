import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

import router from '../api';
import { ApplicationException } from '../common/errors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApplicationException) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
