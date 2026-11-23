import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'student_marketplace_super_secret_jwt_key_2026';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User no longer exists' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Account has been suspended by an administrator.' });
    }

    req.user = user;
    next();
  });
}

export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const user = db.findUserById(decoded.id);
      if (user && !user.is_suspended) {
        req.user = user;
      }
    }
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (
    !req.user ||
    req.user.role !== 'admin' ||
    req.user.email !== 'srikanthstephen2007@gmail.com'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only the verified administrator (srikanthstephen2007@gmail.com) can access system management.'
    });
  }
  next();
}
