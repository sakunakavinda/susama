import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function updateCustomersTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'susama_db',
  });

  try {
    console.log('Connected to MySQL database:', process.env.DB_NAME || 'susama_db');
    
    // Check existing columns in customers table
    const [columns]: any = await connection.query(`DESCRIBE customers;`);
    const existingCols = columns.map((col: any) => col.Field);
    console.log('Existing columns in customers table:', existingCols);

    // 1. Add password_hash column if not exists
    if (!existingCols.includes('password_hash')) {
      console.log('Adding password_hash column...');
      await connection.query(`ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;`);
    }

    // 2. Add is_active column if not exists
    if (!existingCols.includes('is_active')) {
      console.log('Adding is_active column...');
      await connection.query(`ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER postal_code;`);
    }

    // 3. Add last_login column if not exists
    if (!existingCols.includes('last_login')) {
      console.log('Adding last_login column...');
      await connection.query(`ALTER TABLE customers ADD COLUMN last_login DATETIME NULL AFTER is_active;`);
    }

    // 4. Modify phone, address_line1, city to be NULLable for sign up convenience
    console.log('Modifying address and phone columns to be optional/NULLable for simple registration...');
    await connection.query(`ALTER TABLE customers MODIFY COLUMN phone VARCHAR(50) NULL;`);
    await connection.query(`ALTER TABLE customers MODIFY COLUMN address_line1 VARCHAR(255) NULL;`);
    await connection.query(`ALTER TABLE customers MODIFY COLUMN city VARCHAR(100) NULL;`);

    // 5. Ensure email is NOT NULL and UNIQUE if not already
    // First check existing email index
    const [indexes]: any = await connection.query(`SHOW INDEX FROM customers WHERE Column_name = 'email';`);
    if (indexes.length === 0) {
      console.log('Adding UNIQUE index on email...');
      await connection.query(`ALTER TABLE customers MODIFY COLUMN email VARCHAR(255) NOT NULL;`);
      await connection.query(`ALTER TABLE customers ADD UNIQUE INDEX idx_customer_email (email);`);
    }

    console.log('✅ customers table migration successfully applied!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
  }
}

updateCustomersTable();
