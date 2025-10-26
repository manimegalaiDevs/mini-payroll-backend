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

        if (!user) return res.status(404).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        // Prepare JWT payload
        const tokenPayload = {
            id: user.id,
            login_user_id: user.login_user_id,
            user_role: user.user_role,
            staff_detail_id: user.staff_detail_id,
        };

        // Sign JWT
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Send JWT in HTTP-only cookie
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                login_user_id: user.login_user_id,
                user_role: user.user_role,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;