exports.up = function(knex) {
  return knex.schema.alterTable('topics', function(table) {
    table.string('topic_type', 50).defaultTo('general').notNullable();
    table.index(['topic_type']);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('topics', function(table) {
    table.dropIndex(['topic_type']);
    table.dropColumn('topic_type');
  });
};