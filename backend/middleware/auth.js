const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth Debug - Decoded User:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize Debug - Allowed Roles:', roles, 'User Role:', req.user?.role);
    if (!roles.includes(req.user.role)) {
      console.log('Authorize Debug - ACCESS DENIED');
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

const adminAuth = [protect, authorize('admin')];
module.exports = { protect, authorize, adminAuth };
