import { Request, Response } from 'express';
import { pool } from '../config/db';
import { randomUUID } from 'crypto';

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email address to the newsletter
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email, source = 'homepage_vip' } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'The email address format is invalid.'
      });
    }

    // Check if email already exists
    const [existing]: any = await pool.query(
      'SELECT id, email, is_active FROM newsletter_subscribers WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing.length > 0) {
      const subscriber = existing[0];
      if (subscriber.is_active) {
        return res.status(200).json({
          success: true,
          message: 'You are already a member of the SUSÁMÁ VIP Club! ✨',
          already_subscribed: true
        });
      } else {
        // Reactivate previously unsubscribed email
        await pool.query(
          'UPDATE newsletter_subscribers SET is_active = TRUE, unsubscribed_at = NULL, updated_at = NOW() WHERE id = ?',
          [subscriber.id]
        );
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated successfully. 🌿'
        });
      }
    }

    // Insert new subscriber
    const newId = randomUUID();
    await pool.query(
      'INSERT INTO newsletter_subscribers (id, email, source, is_active, subscribed_at) VALUES (?, ?, ?, TRUE, NOW())',
      [newId, cleanEmail, source]
    );

    return res.status(201).json({
      success: true,
      message: 'Welcome to the SUSÁMÁ family! You have successfully subscribed to the VIP Club. ✨',
      data: {
        id: newId,
        email: cleanEmail
      }
    });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete subscription. Please try again later.',
      error: error.message
    });
  }
};

/**
 * GET /api/newsletter/subscribers
 * Get list of newsletter subscribers (Admin / internal use)
 */
export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const [countResult]: any = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count FROM newsletter_subscribers'
    );

    const [rows]: any = await pool.query(
      'SELECT id, email, source, is_active, subscribed_at, unsubscribed_at, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countResult[0]?.total || 0,
        active_count: countResult[0]?.active_count || 0,
        page,
        limit,
        total_pages: Math.ceil((countResult[0]?.total || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers.',
      error: error.message
    });
  }
};

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe an email address
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [result]: any = await pool.query(
      'UPDATE newsletter_subscribers SET is_active = FALSE, unsubscribed_at = NOW() WHERE email = ?',
      [cleanEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscriber list.'
      });
    }

    return res.json({
      success: true,
      message: 'You have been unsubscribed from the newsletter.'
    });
  } catch (error: any) {
    console.error('Error unsubscribasing from newsletter:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process unsubscribe request.',
      error: error.message
    });
  }
};
