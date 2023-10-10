import dotenv from 'dotenv';
import path from 'path';

const loadEnv = () => {
  const envPath = path.join(__dirname, '../config/dev.env');
  dotenv.config({ path: envPath });
};

export default process.env