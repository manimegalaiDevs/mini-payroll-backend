/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(`
        CREATE UNIQUE INDEX unique_current_salary_per_staff
        ON salary_detail (staff_detail_id)
        WHERE is_current = true
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.raw(`
        DROP INDEX IF EXISTS unique_current_salary_per_staff
    `);
};