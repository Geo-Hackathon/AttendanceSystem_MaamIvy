import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check - User role:', req.user.role, 'Required roles:', roles);
    if (!roles.includes(req.user.role)) {
      console.log('Access denied for user:', req.user.name, 'with role:', req.user.role);
      return res.status(403).json({ error: 'Access denied. Required role: ' + roles.join(' or ') });
    }
    next();
  };
};
