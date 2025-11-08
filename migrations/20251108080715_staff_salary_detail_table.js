/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('salary_detail', function (table) {
        table.increments('id').primary();

        table
            .integer('staff_detail_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('staff_detail')
            .onDelete('CASCADE');

        table.string('department', 150).notNullable();
        table.string('position', 75).notNullable();
        table.string('post_level', 40).notNullable();
        table.date('post_start_date').nullable();
        table.string('province', 60).notNullable();
        table.string('divisional_secretariat', 60).nullable();
        table.string('district', 60).notNullable();
        table.string('station', 60).nullable();
        table.string('station_head', 60).nullable();
        table.string('programme_name', 120).nullable();
        table.string('project', 120).nullable();
        table.string('object_code', 25).nullable();
        table.decimal('basic_salary', 10, 2).notNullable();
        table.integer('weekly_duty_hours').notNullable();
        table.decimal('hourly_ot_rate', 10, 2).notNullable();
        table.integer('holyday_calculate_rate').notNullable();
        table.boolean('is_current').notNullable().defaultTo(true);

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('salary_detail');
};
