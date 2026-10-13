import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'susama_luxury_secret_jwt_key_2026_ceylon';

// Generate JWT for customer
const generateToken = (payload: { id: string; email: string; name: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// 1. Customer Registration
export const registerCustomer = async (req: Request, res: Response) => {
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
    const [existing]: any = await pool.query(
      `SELECT id FROM customers WHERE LOWER(email) = ? LIMIT 1`,
      [trimmedEmail]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Insert new customer
    await pool.query(
      `INSERT INTO customers (
        id, name, email, password_hash, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [customerId, trimmedName, trimmedEmail, passwordHash]
    );

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
  } catch (error: any) {
    console.error('Error registering customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to create your account at this moment. Please try again.',
      error: error.message
    });
  }
};

// 2. Customer Login with Email & Password
export const loginCustomer = async (req: Request, res: Response) => {
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
    const [rows]: any = await pool.query(
      `SELECT id, name, email, password_hash, phone, address_line1, address_line2, city, district, postal_code, is_active 
       FROM customers 
       WHERE LOWER(email) = ? LIMIT 1`,
      [trimmedEmail]
    );

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
    const isPasswordValid = await bcrypt.compare(password, customer.password_hash);
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
    await pool.query(`UPDATE customers SET last_login = NOW() WHERE id = ?`, [customer.id]);

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
  } catch (error: any) {
    console.error('Error logging in customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error. Please try again.',
      error: error.message
    });
  }
};

// 3. Get Current Logged-in Customer Profile
export const getCustomerProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.customer?.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const [rows]: any = await pool.query(
      `SELECT id, name, email, phone, address_line1, address_line2, city, district, postal_code, created_at, last_login 
       FROM customers 
       WHERE id = ? LIMIT 1`,
      [customerId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer account not found' });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching customer profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not retrieve profile information.',
      error: error.message
    });
  }
};

// 4. Update Customer Profile
export const updateCustomerProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.customer?.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, phone, address_line1, address_line2, city, district, postal_code } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    await pool.query(
      `UPDATE customers SET 
        name = ?,
        phone = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        district = ?,
        postal_code = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        name.trim(),
        phone?.trim() || null,
        address_line1?.trim() || null,
        address_line2?.trim() || null,
        city?.trim() || null,
        district?.trim() || null,
        postal_code?.trim() || null,
        customerId
      ]
    );

    const [rows]: any = await pool.query(
      `SELECT id, name, email, phone, address_line1, address_line2, city, district, postal_code, updated_at 
       FROM customers 
       WHERE id = ? LIMIT 1`,
      [customerId]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: rows[0]
    });
  } catch (error: any) {
    console.error('Error updating customer profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message
    });
  }
};
