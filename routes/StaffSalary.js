const express = require('express');
const router = express.Router();
const Joi = require('joi');
const salaryService = require('../services/salaryDetail');
const authenticateToken = require('../config/authMiddleware');
const { responseHandlers } = require('../utils/response');
const activityLogger = require('../utils/activityLogger');

// Only Admins can modify
const adminOnly = (req, res, next) => {
    if (req.user.user_role !== 'SUPER_ADMIN') {
        return res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
    }
    next();
};

// Validation
const salarySchema = Joi.object({
    staff_detail_id: Joi.number().integer().required(),
    department: Joi.string().max(150).required(),
    position: Joi.string().max(75).required(),
    post_level: Joi.string().max(40).required(),
    post_start_date: Joi.date().allow(null),
    province: Joi.string().max(60).required(),
    divisional_secretariat: Joi.string().max(60).allow(null),
    district: Joi.string().max(60).required(),
    station: Joi.string().max(60).allow(null),
    station_head: Joi.string().max(60).allow(null),
    programme_name: Joi.string().max(120).allow(null),
    project: Joi.string().max(120).allow(null),
    object_code: Joi.string().max(25).allow(null),
    basic_salary: Joi.number().required(),
    weekly_duty_hours: Joi.number().required(),
    hourly_ot_rate: Joi.number().required(),
    holyday_calculate_rate: Joi.number().required(),
    is_current: Joi.boolean().default(true),
});

// Create salary
router.post('/create', authenticateToken, adminOnly, activityLogger, async (req, res) => {
    const { error } = salarySchema.validate(req.body);
    if (error) return res.status(400).json(responseHandlers.failure(error.details[0].message));

    try {
        const created = await salaryService.createSalary(req.body);
        res.locals.recordId = created.id;
        res.locals.action = 'create';
        res.locals.table = 'salary_detail';
        res.status(201).json(responseHandlers.create(created));
    } catch (err) {
        res.status(500).json(responseHandlers.failure(err.message));
    }
});

// Get all salary for a staff
router.get('/get', async (req, res) => {
    const schema = Joi.object({ staff_detail_id: Joi.number().integer().required() });
    const { error, value } = schema.validate(req.query);
    if (error) return res.status(400).json(responseHandlers.failure(error.details[0].message));

    try {
        const items = await salaryService.getSalaryByStaff(value.staff_detail_id);
        if (!items.length) return res.status(200).json(responseHandlers.empty());
        res.status(200).json(responseHandlers.readAll(items));
    } catch (err) {
        res.status(500).json(responseHandlers.failure(err.message));
    }
});

// Update salary
router.put('/update', authenticateToken, adminOnly, activityLogger, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json(responseHandlers.failure('ID is required'));
    try {
        const updated = await salaryService.updateSalary(id, req.body);
        res.locals.recordId = id;
        res.locals.action = 'update';
        res.locals.table = 'salary_detail';
        res.status(200).json(responseHandlers.update(updated));
    } catch (err) {
        res.status(500).json(responseHandlers.failure(err.message));
    }
});

// Delete salary
router.delete('/delete', authenticateToken, adminOnly, activityLogger, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json(responseHandlers.failure('ID is required'));
    try {
        const deleted = await salaryService.deleteSalary(id);
        if (!deleted) return res.status(404).json(responseHandlers.failure('Record not found'));
        res.locals.recordId = id;
        res.locals.action = 'delete';
        res.locals.table = 'salary_detail';
        res.status(200).json(responseHandlers.delete(id));
    } catch (err) {
        res.status(500).json(responseHandlers.failure(err.message));
    }
});

module.exports = router;
