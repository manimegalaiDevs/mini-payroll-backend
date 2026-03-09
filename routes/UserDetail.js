const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { userSchema } = require("../models/UserDetail");
const { responseHandlers } = require('../utils/response');
const authenticateToken = require('../config/authMiddleware');
const activityLogger = require('../utils/activityLogger');

// Apply authentication and activity logging to all routes in this router
router.use(authenticateToken, activityLogger);

function ensureSuperAdmin(req, res) {
    if (!req.user || req.user.user_role !== 'SUPER_ADMIN') {
        res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
        return false;
    }
    return true;
}

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await db('user_detail').select(
            'id',
            'staff_detail_id',
            'login_user_id',
            'user_role',
            'status'
        );

        if (!users || users.length === 0) {
            return res.status(200).json(responseHandlers.empty());
        }

        return res.status(200).json(responseHandlers.readAll(users));

    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});


// Get user by ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    // Safety check: ensure id is not "undefined" or null
    if (!userId) {
        return res.status(400).json(responseHandlers.failure('No ID provided'));
    }

    try {
        const user = await db('user_detail')
            .where({ id: userId })
            .select('id', 'staff_detail_id', 'login_user_id', 'user_role', 'status')
            .first();

        if (!user) {
            return res.status(404).json(responseHandlers.failure('User not found'));
        }

        return res.status(200).json(responseHandlers.readById(user));

    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});


// Create new user
router.post('/new-user', async (req, res) => {
    if (!ensureSuperAdmin(req, res)) return;

    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const { staff_detail_id, login_user_id, password, user_role, status } = value;

        // Check duplicate login_user_id
        const existingUser = await db('user_detail')
            .where({ login_user_id })
            .first();

        if (existingUser) {
            return res.status(400).json(
                responseHandlers.failure('Login user id already exists')
            );
        }

        // Check if staff exists
        const staff = await db('staff_detail')
            .where({ id: staff_detail_id })
            .first();

        if (!staff) {
            return res.status(400).json(
                responseHandlers.failure('Staff not found')
            );
        }

        // Ensure one staff has only one user account
        const existingStaffUser = await db('user_detail')
            .where({ staff_detail_id })
            .first();

        if (existingStaffUser) {
            return res.status(400).json(
                responseHandlers.failure('This staff already has a user account')
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db('user_detail')
            .insert({
                staff_detail_id,
                login_user_id,
                password: hashedPassword,
                user_role,
                status
            })
            .returning(['id', 'staff_detail_id', 'login_user_id', 'user_role', 'status']);

        // activityLogger info
        res.locals.recordId = newUser.id;
        res.locals.action = 'create';
        res.locals.table = 'user_detail';

        return res.status(201).json(responseHandlers.create(newUser));

    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

router.put('/:id', async (req, res) => {
    if (!ensureSuperAdmin(req, res)) return;

    const { error: idError, value: idValue } = idSchema.validate(req.params);
    if (idError) {
        return res.status(400).json(responseHandlers.failure(idError.details[0].message));
    }

    const { error: bodyError, value: bodyValue } = updateUserSchema.validate(req.body);
    if (bodyError) {
        return res.status(400).json(responseHandlers.failure(bodyError.details[0].message));
    }

    try {

        const id = idValue.id;
        const user = await db('user_detail').where({ id }).first();
        if (!user) {
            return res.status(404).json(responseHandlers.failure('User not found'));
        }

        const updatedData = { ...bodyValue };

        if (bodyValue.password) {
            updatedData.password = await bcrypt.hash(bodyValue.password, 10);
        }
        const [updatedUser] = await db('user_detail')
            .where({ id })
            .update(updatedData)
            .returning(['id', 'staff_detail_id', 'login_user_id', 'user_role', 'status']);

        res.locals.recordId = updatedUser.id;
        res.locals.action = 'update';
        res.locals.table = 'user_detail';

        return res.status(200).json(responseHandlers.update(updatedUser));

    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    if (!ensureSuperAdmin(req, res)) return;

    const { error, value } = idSchema.validate(req.params);

    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const user = await db('user_detail').where({ id: value.id }).first();
        if (!user) {
            return res.status(404).json(responseHandlers.failure('User not found'));
        }

        await db('user_detail').where({ id: value.id }).del();

        res.locals.recordId = value.id;
        res.locals.action = 'delete';
        res.locals.table = 'user_detail';

        return res.status(200).json(responseHandlers.delete(value.id));

    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

module.exports = router;