/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_activity_detail', function (table) {
        table.increments('id').primary(); // Primary key (auto-increment)

        // Foreign key reference to user_detail.id
        table
            .integer('user_detail_id')
            .unsigned()
            .nullable()
            .references('id')
            .inTable('user_detail')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        table.string('do_action', 45).notNullable(); // Action performed (e.g. INSERT, UPDATE)
        table.string('action_table', 60).notNullable(); // Table name where action occurred
        table.integer('action_table_id').notNullable(); // Record ID affected by the action
        table.timestamp('action_date_time').defaultTo(knex.fn.now()); // Action timestamp

        // Optional timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_activity_detail');
};
