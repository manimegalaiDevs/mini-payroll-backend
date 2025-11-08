const express = require('express');
const router = express.Router();
const Joi = require('joi');
const staffService = require('../services/staff');
const { responseHandlers } = require('../utils/response');
const activityLogger = require('../utils/activitylogger');
const authenticateToken = require('../config/authMiddleware');

// Validation schema
const staffSchema = Joi.object({
    first_name: Joi.string().max(75).required(),
    last_name: Joi.string().max(75).allow(null, ''),
    NIC: Joi.string().max(15).required(),
    employee_no: Joi.string().max(15).required(),
    contact_no: Joi.string().max(60).required(),
    province: Joi.string().max(60).required(),
    divisional_secretariat: Joi.string().max(60).required(),
    district: Joi.string().max(150).required(),
});

// CREATE STAFF (Super Admin only)
router.post('/create', authenticateToken, activityLogger, async (req, res) => {
    if (req.user.user_role !== 'SUPER_ADMIN') {
        return res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
    }

    const { error } = staffSchema.validate(req.body);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const created = await staffService.createStaff(req.body);
        res.locals.recordId = created.id;
        res.locals.action = 'create';
        res.locals.table = 'staff_detail';
        return res.status(201).json(responseHandlers.create(created));
    } catch (err) {
        return res.status(400).json(responseHandlers.failure(err.message));
    }
});

// FETCH ALL STAFF (no pagination)
router.get('/getall', async (req, res) => {
    try {
        // Based on req user, will send different data in future
        const items = await staffService.getAllStaff();
        if (!items || items.length === 0) {
            return res.status(200).json(responseHandlers.empty());
        }
        return res.status(200).json(responseHandlers.readAll(items));
    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

// FETCH STAFF WITH PAGINATION
router.get('/get', async (req, res) => {
    // Based on req user, will send different data in future
    const paginationSchema = Joi.object({
        skip: Joi.number().integer().min(0).optional(),
        take: Joi.number().integer().min(1).optional(),
    });

    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    const skip = value.skip ?? 0;
    const take = value.take ?? 10;

    try {
        const result = await staffService.getStaffPaginated({ skip, take });
        if (!result.items || result.items.length === 0) {
            return res.status(200).json(responseHandlers.empty());
        }

        return res.status(200).json({
            ...responseHandlers.readAll(result.items),
            total: result.total,
            skip: result.skip,
            take: result.take,
        });
    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

// UPDATE STAFF (Super Admin only)
router.put('/update', authenticateToken, activityLogger, async (req, res) => {
    if (req.user.user_role !== 'SUPER_ADMIN') {
        return res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
    }

    const schema = Joi.object({ id: Joi.number().integer().required() });
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const updated = await staffService.updateStaff(value.id, req.body);

        res.locals.recordId = value.id;
        res.locals.action = 'update';
        res.locals.table = 'staff_detail';

        return res.status(200).json(responseHandlers.update(updated));
    } catch (err) {
        return res.status(400).json(responseHandlers.failure(err.message));
    }
});

router.delete('/delete', authenticateToken, activityLogger, async (req, res) => {
    if (req.user.user_role !== 'SUPER_ADMIN') {
        return res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
    }

    const schema = Joi.object({ id: Joi.number().integer().required() });
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const deleted = await staffService.deleteStaff(value.id);
        if (!deleted) {
            return res.status(404).json(responseHandlers.failure('Staff not found or already deleted'));
        }

        res.locals.recordId = value.id;
        res.locals.action = 'delete';
        res.locals.table = 'staff_detail';

        return res.status(200).json(responseHandlers.delete(value.id));
    } catch (err) {
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

module.exports = router;
