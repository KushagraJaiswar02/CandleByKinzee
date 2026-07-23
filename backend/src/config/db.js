import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise;

export function connectDb(uri = env.mongoUri) {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      autoIndex: !env.isProduction
    });
  }
  return connectionPromise;
}

export async function disconnectDb() {
  connectionPromise = undefined;
  await mongoose.disconnect();
}
