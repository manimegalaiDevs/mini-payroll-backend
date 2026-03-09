const Joi = require('joi');
const { ROLES } = require('../config/AppRoleDetails');

const ROLE_KEYS = Object.keys(ROLES);

const userSchema = Joi.object({
    id: Joi.number().integer().optional(),
    staff_detail_id: Joi.number().integer().allow(null), // Not required for super admin — so allow null or empty
    login_user_id: Joi.string()        // Alphanumeric login ID (letters, numbers, underscores)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .max(45)
        .required(),
    // Password: at least 8 chars, must contain letters, numbers, and special characters
    password: Joi.string()
        .alphanum() // Ensures only a-z, A-Z, and 0-9
        .min(8)
        .max(25)
        .required()
        .messages({
            'string.alphanum': 'Password must only contain letters and numbers.',
            'string.min': 'Password must be at least 8 characters long.',
        }),
    user_role: Joi.string() // User role (limited to valid roles)
        .valid(...ROLE_KEYS)
        .max(30)
        .default('STAFF_USER'),
    status: Joi.string()    // Status options
        .valid('active', 'inactive')
        .max(30)
        .default('active'),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional(),
});

module.exports = { userSchema };
