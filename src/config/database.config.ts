import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gio-long',
  options: {
    dbName: process.env.DATABASE_NAME || 'gio-long',
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
  }
}));