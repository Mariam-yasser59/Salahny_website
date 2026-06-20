import mongoose from 'mongoose';

let status = 'not_configured';
let message = 'MongoDB URI was not provided';

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) return { status, message };

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    status = 'connected';
    message = 'MongoDB connected';
  } catch (error) {
    status = 'error';
    message = error.message;
    console.warn(`MongoDB connection failed: ${error.message}`);
  }

  return { status, message };
};

export const databaseStatus = () => ({ status, message });
