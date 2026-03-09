const express = require('express');
const router = express.Router();
const Joi = require('joi');
const salaryService = require('../services/salaryDetail');
const authenticateToken = require('../config/authMiddleware');
const { salarySchema } = require('../models/salaryDetails')
const { responseHandlers } = require('../utils/response');
const activityLogger = require('../utils/activityLogger');

// Only Admins can modify
const adminOnly = (req, res, next) => {
    if (req.user.user_role !== 'SUPER_ADMIN') {
        return res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
    }
    next();
};

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

    const idSchema = Joi.object({
        id: Joi.number().integer().required()
    });

    const { error: idError, value } = idSchema.validate(req.query);
    if (idError) return res.status(400).json(responseHandlers.failure(idError.details[0].message));

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json(responseHandlers.failure('Update payload cannot be empty'));
    }

    const { error } = salaryUpdateSchema.validate(req.body);
    if (error) return res.status(400).json(responseHandlers.failure(error.details[0].message));

    try {
        const updated = await salaryService.updateSalary(value.id, req.body);

        res.locals.recordId = value.id;
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
