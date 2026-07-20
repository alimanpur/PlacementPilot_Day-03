import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { authLogger } from '../lib/logger.js'
import { User } from '../models/user.model.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2) {
        token = parts[1];
      }
    } else {
      token = req.cookies?.accessToken;
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        data: null,
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshToken').where('deletedAt').equals(null);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    authLogger.warn('Authentication failed', { error: error.message });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      data: null,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        data: null,
      });
    }

    next();
  };
};