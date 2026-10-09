import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDB() {
  console.log('Connecting to MySQL server...');
  
  // Connect without database first to create it if it doesn't exist
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Important for running SQL files
  });

  try {
    const dbName = process.env.DB_NAME || 'susama_db';
    
    console.log(`Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema script...');
    await connection.query(sql);

    console.log('✅ Database initialization complete! All tables created.');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initDB();
