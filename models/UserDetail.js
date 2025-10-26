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
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
        .max(255)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 8 characters, including letters, numbers, and a special character.',
        }),
    user_role: Joi.string() // User role (limited to valid roles)
        .valid(...ROLE_KEYS)
        .max(30)
        .default('STAFF_USER'),
    status: Joi.string()    // Status options
        .valid('Active', 'Deactive')
        .max(30)
        .default('Active'),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional(),
});

module.exports = { userSchema };
