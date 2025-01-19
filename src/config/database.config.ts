import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sport_app',
  options: {
    dbName: process.env.DATABASE_NAME || 'sport_app',
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
  }
}));