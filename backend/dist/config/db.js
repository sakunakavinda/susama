"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'susama_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Test connection
const checkConnection = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Successfully connected to MySQL database');
        connection.release();
    }
    catch (error) {
        console.error('❌ Failed to connect to MySQL database:', error);
    }
};
checkConnection();
