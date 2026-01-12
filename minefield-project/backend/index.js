const express = require('express');
const app = express();
const gameBoardRouter = require('./routes/gameBoard.js');
const PORT = process.env.PORT || 4001;
//need to update to HTTPS
//need to update to ENV
const FRONTEND_BASE_URL = 
    process.env.NODE_ENV === 'production' 
        ? 'https://ecommerceapi-5-iktx.onrender.com'
        : 'http://localhost:3000';
const cors = require('cors');

app.use(express.static('public'));
app.use(cors({ credentials: true, origin: FRONTEND_BASE_URL })); //allows credentials request

app.use('/gameBoard', gameBoardRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})