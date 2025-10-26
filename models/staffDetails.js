const Joi = require('joi');

const staffSchema = Joi.object({
    id: Joi.number().integer().optional(),

    // First name (required)
    first_name: Joi.string()
        .max(75)
        .required()
        .messages({
            'string.empty': 'First name is required.',
        }),

    // Last name (optional)
    last_name: Joi.string()
        .max(75)
        .allow(null, ''),

    // NIC - unique (must follow NIC format, e.g., old 9 digits + letter or new 12 digits)
    NIC: Joi.string()
        .pattern(/^([0-9]{9}[vVxX]|[0-9]{12})$/)
        .max(15)
        .required()
        .messages({
            'string.empty': 'NIC is required.',
            'string.pattern.base': 'Invalid NIC format. Use 9 digits + V/X or 12 digits.',
        }),

    // Employee number - required alphanumeric
    employee_no: Joi.string()
        .alphanum()
        .max(15)
        .required()
        .messages({
            'string.alphanum': 'Employee number must contain only letters and numbers.',
            'string.empty': 'Employee number is required.',
        }),

    // Contact number - optional but must be digits if provided
    contact_no: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .allow(null, '')
        .messages({
            'string.pattern.base': 'Contact number must contain only digits (10–15 length).',
        }),

    province: Joi.string().max(60).allow(null, ''),
    divisional_secretariat: Joi.string().max(60).allow(null, ''),
    district: Joi.string().max(150).allow(null, ''),

    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional(),
});

module.exports = { staffSchema };
