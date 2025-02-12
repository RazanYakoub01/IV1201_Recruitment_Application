const { Pool } = require('pg'); 

// Directly define PostgreSQL credentials
const pool = new Pool({
  user: 'postgres',        // ✅ Set PostgreSQL username here
  host: 'recruitment_db_container',       // ✅ Set your database host
  database: 'recruitment', // ✅ Your database name
  password: 'password',    // ✅ Your database password (update if needed)
  port: 5432,              // ✅ PostgreSQL port (default: 5432)
});

module.exports = pool;
