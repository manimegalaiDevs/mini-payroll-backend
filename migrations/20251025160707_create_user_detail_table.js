/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_detail', function (table) {
        table.increments('id').primary();
        table.integer('staff_detail_id').unsigned().nullable();
        table.string('login_user_id', 45).notNullable().unique(); // unique login id
        table.string('password', 255).notNullable();
        table.string('user_role', 30).notNullable().defaultTo('user');
        table.string('status', 30).notNullable().defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_detail');
};
