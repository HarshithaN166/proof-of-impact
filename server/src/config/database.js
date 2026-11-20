import mongoose from 'mongoose';

let memoryServer = null;

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proof_of_impact';

  try {
    // Attempt standard connection first with 3 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB at ${uri} (${err.message}).`);
    console.log('[Database] Starting built-in zero-config MongoMemoryServer fallback...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'proof_of_impact',
        },
      });
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to in-memory MongoDB at ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start MongoDB fallback:', memErr);
      throw memErr;
    }
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

