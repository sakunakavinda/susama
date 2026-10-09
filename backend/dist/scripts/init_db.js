"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function initDB() {
    console.log('Connecting to MySQL server...');
    // Connect without database first to create it if it doesn't exist
    const connection = await promise_1.default.createConnection({
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
        const schemaPath = path_1.default.join(__dirname, '../../database/schema.sql');
        const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
        console.log('Executing schema script...');
        await connection.query(sql);
        console.log('✅ Database initialization complete! All tables created.');
    }
    catch (error) {
        console.error('❌ Error initializing database:', error);
    }
    finally {
        await connection.end();
    }
}
initDB();
