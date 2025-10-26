exports.up = function (knex) {
    return knex.schema.alterTable('user_activity_detail', function (table) {
        table.integer('user_detail_id').unsigned().nullable().alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('user_activity_detail', function (table) {
        table.integer('user_detail_id').unsigned().notNullable().alter();
    });
};
