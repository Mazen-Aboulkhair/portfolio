import mongoose, { Mongoose } from 'mongoose';

// Define the cached mongoose connection type
interface CachedConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Declare the global variable in the global namespace
declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Access the cached connection from the global scope
const cached: CachedConnection = global.mongoose || { conn: null, promise: null };

// Ensure global mongoose is initialized
if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }
  
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance: Mongoose) => {
        return mongooseInstance;
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default connectToDatabase; 