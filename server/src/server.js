import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { seedDatabase } from './scripts/seed.js';
import { initializeBlockchain } from './services/blockchainService.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    await seedDatabase();
    initializeBlockchain();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Proof of Impact API running on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();

