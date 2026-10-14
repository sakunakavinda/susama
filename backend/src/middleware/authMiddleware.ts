import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'susama_luxury_secret_jwt_key_2026_ceylon';

export interface AuthenticatedCustomer {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  customer?: AuthenticatedCustomer;
}

export const verifyCustomerToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedCustomer;
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please sign in again.'
    });
  }
};

export const optionalCustomerToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedCustomer;
      req.customer = decoded;
    } catch {
      // Continue without user if token is invalid or expired
    }
  }
  next();
};
