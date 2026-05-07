import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'salahny-dev-secret';

export const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '8h' });

export const requireAuth = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Missing authorization token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (roles.length && !roles.includes(payload.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
