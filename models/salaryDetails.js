const Joi = require('joi');

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

module.exports = { salarySchema };
