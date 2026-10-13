"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerProfile = exports.getCustomerProfile = exports.loginCustomer = exports.registerCustomer = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET || 'susama_luxury_secret_jwt_key_2026_ceylon';
// Generate JWT for customer
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
// 1. Customer Registration
const registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide your full name.' });
        }
        if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
        }
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        // Check if customer already exists
        const [existing] = await db_1.pool.query(`SELECT id FROM customers WHERE LOWER(email) = ? LIMIT 1`, [trimmedEmail]);
        if (existing && existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists. Please sign in instead.'
            });
        }
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        // Insert new customer
        await db_1.pool.query(`INSERT INTO customers (
        id, name, email, password_hash, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`, [customerId, trimmedName, trimmedEmail, passwordHash]);
        // Generate JWT
        const token = generateToken({
            id: customerId,
            email: trimmedEmail,
            name: trimmedName
        });
        return res.status(201).json({
            success: true,
            message: 'Welcome to SUSÁMÁ! Your account was created successfully.',
            data: {
                token,
                customer: {
                    id: customerId,
                    name: trimmedName,
                    email: trimmedEmail,
                    phone: null,
                    address_line1: null,
                    address_line2: null,
                    city: null,
                    district: null,
                    postal_code: null
                }
            }
        });
    }
    catch (error) {
        console.error('Error registering customer:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to create your account at this moment. Please try again.',
            error: error.message
        });
    }
};
exports.registerCustomer = registerCustomer;
// 2. Customer Login with Email & Password
const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter both your email address and password.'
            });
        }
        const trimmedEmail = email.trim().toLowerCase();
        // Find customer by email
        const [rows] = await db_1.pool.query(`SELECT id, name, email, password_hash, phone, address_line1, address_line2, city, district, postal_code, is_active 
       FROM customers 
       WHERE LOWER(email) = ? LIMIT 1`, [trimmedEmail]);
        if (!rows || rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'No account found with this email address. Please check your spelling or create an account.'
            });
        }
        const customer = rows[0];
        // If customer was created via guest order without password
        if (!customer.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'This email is linked to an order. Please create an account to set a password.'
            });
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, customer.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Please verify and try again.'
            });
        }
        if (customer.is_active === 0 || customer.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact SUSÁMÁ customer care.'
            });
        }
        // Update last login
        await db_1.pool.query(`UPDATE customers SET last_login = NOW() WHERE id = ?`, [customer.id]);
        // Generate JWT
        const token = generateToken({
            id: customer.id,
            email: customer.email,
            name: customer.name
        });
        return res.json({
            success: true,
            message: `Welcome back, ${customer.name}!`,
            data: {
                token,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address_line1: customer.address_line1,
                    address_line2: customer.address_line2,
                    city: customer.city,
                    district: customer.district,
                    postal_code: customer.postal_code
                }
            }
        });
    }
    catch (error) {
        console.error('Error logging in customer:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed due to a server error. Please try again.',
            error: error.message
        });
    }
};
exports.loginCustomer = loginCustomer;
// 3. Get Current Logged-in Customer Profile
const getCustomerProfile = async (req, res) => {
    try {
        const customerId = req.customer?.id;
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const [rows] = await db_1.pool.query(`SELECT id, name, email, phone, address_line1, address_line2, city, district, postal_code, created_at, last_login 
       FROM customers 
       WHERE id = ? LIMIT 1`, [customerId]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer account not found' });
        }
        return res.json({
            success: true,
            data: rows[0]
        });
    }
    catch (error) {
        console.error('Error fetching customer profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve profile information.',
            error: error.message
        });
    }
};
exports.getCustomerProfile = getCustomerProfile;
// 4. Update Customer Profile
const updateCustomerProfile = async (req, res) => {
    try {
        const customerId = req.customer?.id;
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { name, phone, address_line1, address_line2, city, district, postal_code } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        }
        await db_1.pool.query(`UPDATE customers SET 
        name = ?,
        phone = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        district = ?,
        postal_code = ?,
        updated_at = NOW()
       WHERE id = ?`, [
            name.trim(),
            phone?.trim() || null,
            address_line1?.trim() || null,
            address_line2?.trim() || null,
            city?.trim() || null,
            district?.trim() || null,
            postal_code?.trim() || null,
            customerId
        ]);
        const [rows] = await db_1.pool.query(`SELECT id, name, email, phone, address_line1, address_line2, city, district, postal_code, updated_at 
       FROM customers 
       WHERE id = ? LIMIT 1`, [customerId]);
        return res.json({
            success: true,
            message: 'Profile updated successfully!',
            data: rows[0]
        });
    }
    catch (error) {
        console.error('Error updating customer profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile.',
            error: error.message
        });
    }
};
exports.updateCustomerProfile = updateCustomerProfile;
