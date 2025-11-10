const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, COOKIE_OPTIONS } = require('../config/jwtConfig');

// User login
router.post('/login', async (req, res) => {
    try {
        const { login_user_id, password } = req.body;

        if (!login_user_id || !password)
            return res.status(400).json({ message: 'Username and password are required' });

        const user = await db('user_detail').where({ login_user_id }).first();

        // Combine user not found and invalid password for security
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials', loggedIn: false });
        }

        const tokenPayload = {
            id: user.id,
            login_user_id: user.login_user_id,
            user_role: user.user_role,
            staff_detail_id: user.staff_detail_id,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: 'Login successful',
            loggedIn: true,
            user: {
                id: user.id,
                login_user_id: user.login_user_id,
                user_role: user.user_role,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error', loggedIn: false });
    }
});

// Validate user session
router.get('/valid-user', async (req, res) => {
    try {
        const token = req.cookies[COOKIE_NAME];
        if (!token) {
            return res.status(401).json({ validUser: false });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // verify user still exists
        const user = await db('user_detail').where({ id: decoded.id }).first();
        if (!user) {
            return res.status(401).json({ validUser: false });
        }

        return res.status(200).json({
            message: 'Login successful',
            loggedIn: true,
            user: {
                id: user.id,
                login_user_id: user.login_user_id,
                user_role: user.user_role,
                staff_detail_id: user.staff_detail_id,
            },
        });
    } catch (error) {
        console.error('Valid user check error:', error);
        return res.status(500).json({ message: 'Internal server error', loggedIn: false });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;