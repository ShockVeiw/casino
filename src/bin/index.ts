import dotenv from 'dotenv';
dotenv.config();

import bootsrap from './bootsrap';
import connectDB from './connect-db';

connectDB().then(() => {
  bootsrap();
});
