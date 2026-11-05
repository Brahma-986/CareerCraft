import mongoose from 'mongoose';

export function withDatabaseName(uri, dbName = 'careercraft') {
  const trimmed = String(uri || '').trim();
  const scheme = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)/i);
  if (!scheme) return trimmed;
  const rest = trimmed.slice(scheme[0].length);
  const pathStart = rest.search(/[/?]/);
  const host = pathStart === -1 ? rest : rest.slice(0, pathStart);
  const tail = pathStart === -1 ? '' : rest.slice(pathStart);
  const path = tail.startsWith('/') ? tail.slice(1).split('?')[0] : '';
  if (path) return trimmed;
  const query = tail.includes('?') ? tail.slice(tail.indexOf('?')) : '';
  return `${scheme[0]}${host}/${dbName}${query}`;
}

export async function connectDB(uri = process.env.MONGO_URI) {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!uri) {
    throw new Error('MONGO_URI is not configured.');
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(withDatabaseName(uri), { serverSelectionTimeoutMS: 5000 });
    return mongoose.connection;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && uri.includes('mongodb+srv://')) {
      const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/careercraft';
      console.warn(`[db] Atlas cluster could not be reached (IP not whitelisted or offline). Attempting local MongoDB at ${localUri}...`);
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`[db] Connected to local MongoDB fallback successfully.`);
      return mongoose.connection;
    }
    throw error;
  }
}
