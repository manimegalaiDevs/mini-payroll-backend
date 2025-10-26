/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('staff_detail', function (table) {
        table.increments('id').primary();
        table.string('first_name', 75).notNullable();
        table.string('last_name', 75);
        table.string('NIC', 15).notNullable().unique();
        table.string('employee_no', 15).notNullable();
        table.string('contact_no', 60);
        table.string('province', 60);
        table.string('divisional_secretariat', 60);
        table.string('district', 150);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('staff_detail');
};
