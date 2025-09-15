exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.string('id', 100).primary();
    table.string('username', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255);
    table.integer('ranking').defaultTo(1500);
    table.string('level', 50).defaultTo('Beginner');
    table.integer('topics_completed').defaultTo(0);
    table.integer('debates_won').defaultTo(0);
    table.integer('debates_lost').defaultTo(0);
    table.timestamp('join_date').defaultTo(knex.fn.now());
    table.timestamp('last_active').defaultTo(knex.fn.now());
    table.boolean('is_active').defaultTo(true);
    table.json('preferences').defaultTo('{}');
    
    table.index(['username']);
    table.index(['email']);
    table.index(['ranking']);
    table.index(['last_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};