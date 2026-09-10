try {
  const Pool = require("pg").Pool;
  let pool;
  if (process.env.NODE_ENV !== "production") {
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  } else {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  module.exports = {
    Pool,
    pool,
  };
} catch (e) {
  console.error("🚨 FATAL ERROR during Database setup:", e.message);
  console.error(e.stack);
  // Re-throw the error to ensure the crash is logged by the deployment service
  throw e;
}
