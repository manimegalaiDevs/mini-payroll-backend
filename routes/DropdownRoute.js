const express = require('express');
const router = express.Router();
const Joi = require('joi');
const dropdownService = require('../services/dropdown');
const { responseHandlers } = require('../utils/response');
const activityLogger = require('../utils/activitylogger');
const authenticateToken = require('../config/authMiddleware');


// Shared Joi validation schema
const schema = Joi.object({
    id: Joi.number().integer().optional(),
    dropdown_type: Joi.string().required(),
    item_value: Joi.string().required(),
    filter_by: Joi.string().optional()
});

const itemSchema = Joi.object({
    dropdown_type: Joi.string().required(),
    item_value: Joi.string().required(),
    filter_by: Joi.string().allow(null),
});

const schema2 = Joi.alternatives().try(
    itemSchema,
    Joi.array().items(itemSchema)
);

router.post('/create', authenticateToken, activityLogger, async (req, res) => {
    if (req.user.user_role !== 'SUPER_ADMIN') {
        return res.status(403).json(responseHandlers.failure('Forbidden: Super Admins only'));
    }
    const { error } = schema2.validate(req.body);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const result = await dropdownService.createItem(req.body);
        const insertedId = result.inserted?.[0]?.id || null;
        if (insertedId) {
            res.locals.recordId = insertedId;
        }
        res.locals.action = 'create';
        res.locals.table = 'dropdown_item';

        return res.status(201).json(({
            inserted: result.inserted,
            skipped: result.skipped,
            message: result.message
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

router.get('/get', async (req, res) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const items = await dropdownService.getDropdownItemsByFilters(value);
        if (!items || items.length === 0) {
            return res.status(200).json(responseHandlers.empty());
        }
        return res.status(200).json(responseHandlers.readAll(items));
    } catch (err) {
        console.error(err);
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

router.get('/getall', async (req, res) => {
    const paginationSchema = Joi.object({
        skip: Joi.number().integer().min(0).optional(),
        take: Joi.number().integer().min(1).optional()
    });

    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    const skip = value.skip ?? 0;
    const take = value.take ?? 9;

    try {
        const result = await dropdownService.getAllItems({ skip, take });

        if (!result.items || result.items.length === 0) {
            return res.status(200).json(responseHandlers.empty());
        }

        return res.status(200).json({
            ...responseHandlers.readAll(result.items),
            total: result.total,
            skip: result.skip,
            take: result.take
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

router.put('/update', authenticateToken, activityLogger, async (req, res) => {
    const schema = Joi.object({ id: Joi.number().integer().required() });
    const { error, value } = schema.validate(req.query); // validate query param id

    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const updated = await dropdownService.updateItem(value.id, req.body);
        res.locals.recordId = value.id;
        res.locals.action = 'update';
        res.locals.table = 'dropdown_item';

        return res.status(200).json(responseHandlers.update(value.id));
    } catch (err) {
        console.error(err);
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

router.delete('/delete', authenticateToken, activityLogger, async (req, res) => {
    const schema = Joi.object({ id: Joi.number().integer().required() });
    const { error, value } = schema.validate(req.query); // validate query param id

    if (error) {
        return res.status(400).json(responseHandlers.failure(error.details[0].message));
    }

    try {
        const deleted = await dropdownService.deleteItem(value.id);
        if (!deleted) {
            return res.status(404).json(responseHandlers.failure('Item not found or already deleted'));
        }

        res.locals.recordId = value.id;
        res.locals.action = 'delete';
        res.locals.table = 'dropdown_item';
        return res.status(200).json(responseHandlers.delete(value.id));
    } catch (err) {
        console.error(err);
        return res.status(500).json(responseHandlers.failure(err.message));
    }
});

module.exports = router;
