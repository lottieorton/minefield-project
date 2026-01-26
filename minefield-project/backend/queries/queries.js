try {
    const Pool = require('pg').Pool;
    let pool;
    if(process.env.NODE_ENV !== 'production') {
        pool = new Pool({
            user: 'me',
            host:'localhost',
            database: 'MineSweeper',
            password: 'password',
            port: 5432
        });
    } else {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL, //TO BE SET UP WHEN DEPLOY TO RENDER
        });
    }
    module.exports = {
        Pool, 
        pool
    };
} catch(e) {
    console.error("🚨 FATAL ERROR during Database setup:", e.message);
    console.error(e.stack);
    // Re-throw the error to ensure the crash is logged by the deployment service
    throw e;
};