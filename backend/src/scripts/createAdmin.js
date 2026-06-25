import bcrypt from 'bcryptjs';
import pool from '../db/index.js';
import dotenv from 'dotenv';
dotenv.config();

const hash = await bcrypt.hash('admin123', 10);
await pool.query(
  'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
  ['admin', hash]
);
console.log('✅ Admin created: username=admin password=admin123');
pool.end();