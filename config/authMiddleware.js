const jwt = require('jsonwebtoken');
const { JWT_SECRET, COOKIE_NAME } = require('./jwtConfig');

module.exports = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // attach decoded payload
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
