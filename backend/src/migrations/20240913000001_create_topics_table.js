exports.up = function(knex) {
  return knex.schema.createTable('topics', function(table) {
    table.string('id', 200).primary();
    table.string('user_id', 100).notNullable().index();
    table.string('title', 200).notNullable();
    table.string('category', 50).notNullable();
    table.integer('complexity_level').notNullable().checkBetween([1, 10]);
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_modified').defaultTo(knex.fn.now());
    table.string('position', 50).defaultTo('neutral');
    table.integer('conviction').defaultTo(5).checkBetween([1, 10]);
    
    table.index(['user_id', 'created_at']);
    table.index(['category']);
    table.index(['complexity_level']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('topics');
};