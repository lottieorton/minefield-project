function loadEnv () {
    if (process.env.NODE_ENV !== 'production') {
        const dotenv = require("dotenv");
        dotenv.config();
        return true;
    };
    return false;
}

module.exports = loadEnv;