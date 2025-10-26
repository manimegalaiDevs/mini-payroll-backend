const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await db('user_detail');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await db('user_detail').where({ id: req.params.id }).first();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { staff_detail_id, login_user_id, password, user_role, status } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db('user_detail')
            .insert({ staff_detail_id, login_user_id, password: hashedPassword, user_role, status })
            .returning('*');

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { staff_detail_id, login_user_id, password, user_role, status } = req.body;
        const updatedData = { staff_detail_id, login_user_id, user_role, status };

        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const [updatedUser] = await db('user_detail')
            .where({ id: req.params.id })
            .update(updatedData)
            .returning('*');

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        await db('user_detail').where({ id: req.params.id }).del();
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
