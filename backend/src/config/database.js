const knex = require('knex');

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'debaterank',
    password: process.env.DB_PASSWORD || 'debaterank',
    database: process.env.DB_NAME || 'debaterank'
  },
  migrations: {
    directory: '../migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: '../seeds'
  },
  pool: {
    min: 2,
    max: 10
  }
};

const db = knex(config);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;