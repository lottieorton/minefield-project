const { pool } = require('./queries');

const getScores = async (req, res) => {
    //console.log('req.body' + req.body);
    const { username } = req.user;
    console.log('req.user getScores:' + JSON.stringify(req.user));
    try {
        const result = await pool.query(`
            SELECT difficulty
            ,COUNT(*) FILTER (WHERE win) AS wins
            ,COUNT(*) FILTER (WHERE NOT win) AS losses
            ,COUNT(*) AS games
            ,COUNT(*) FILTER (WHERE win) * 100 / COUNT(*) AS wlRatio
            FROM games 
            JOIN users 
            ON games.user_id = users.id 
            WHERE users.username = $1
            GROUP BY difficulty;`, 
            [username]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            msg: error.message || 'Unable to retrieve scores due to a server error'
        });
    }
};

const saveScore = async (req, res) => {
    console.log('req.body: ' + JSON.stringify(req.body));
    const { difficulty, win } = req.body;
    const { username } = req.user;
    try {
        const result = await pool.query(`INSERT INTO games (user_id, difficulty, win) 
            SELECT id, $2, $3
            FROM users
            WHERE username = $1
            RETURNING *`, 
            [username, difficulty, win]
        );
        res.status(201).json(result.rows);
    } catch (error) {
        res.status(500).json({
            msg: error.message || 'Unable to save score due to server error'
        });
    }
};

module.exports = {
    getScores,
    saveScore
};