import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { assertRuntimeEnv } from './config/env.js';

const port = Number(process.env.PORT || 5000);

assertRuntimeEnv();

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`CareerCraft API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed.');
    const detail = String(error?.message || 'Unknown database error')
      .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, 'mongodb://[redacted]');
    console.error(detail.split('\n')[0].slice(0, 300));
    if (/whitelist|ip address is/i.test(detail)) {
      console.error('Add this computer in Atlas under Network Access, then restart the API.');
    }
    process.exit(1);
  });
