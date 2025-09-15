module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'debaterank',
      password: process.env.DB_PASSWORD || 'debaterank',
      database: process.env.DB_NAME || 'debaterank'
    },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};