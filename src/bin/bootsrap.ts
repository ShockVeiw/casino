import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 3000;

export default function bootstrap() {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Closing HTTP server...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}
