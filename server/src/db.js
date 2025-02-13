const { Pool } = require('pg'); 

const pool = new Pool({
  user: 'postgres',        
  host: 'recruitment_db_container',       
  database: 'recruitment',
  password: 'password',   
  port: 5432,              
});

module.exports = pool;
