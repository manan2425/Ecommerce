import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current working directory:', process.cwd());
dotenv.config();
console.log('MONGODB_URL from root .env:', process.env.MONGODB_URL ? 'FOUND' : 'MISSING');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });
console.log('MONGODB_URL from server/.env:', process.env.MONGODB_URL ? 'FOUND' : 'MISSING');
