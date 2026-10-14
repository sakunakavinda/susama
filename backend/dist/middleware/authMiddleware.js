"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalCustomerToken = exports.verifyAdminToken = exports.verifyCustomerToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'susama_luxury_secret_jwt_key_2026_ceylon';
const verifyCustomerToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authorization token provided.'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.customer = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication session. Please sign in again.'
        });
    }
};
exports.verifyCustomerToken = verifyCustomerToken;
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Administrator authentication required.'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Customer accounts cannot access store admin and bank settings.'
            });
        }
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired administrator session. Please sign in as administrator.'
        });
    }
};
exports.verifyAdminToken = verifyAdminToken;
const optionalCustomerToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.customer = decoded;
        }
        catch {
            // Continue without user if token is invalid or expired
        }
    }
    next();
};
exports.optionalCustomerToken = optionalCustomerToken;
