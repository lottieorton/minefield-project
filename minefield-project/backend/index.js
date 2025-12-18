const express = require('express');
const app = express();
const gameBoardRouter = require('./routes/gameBoard.js');
const PORT = process.env.PORT || 4001;

app.use(express.static('public'));

app.use('/gameBoard', gameBoardRouter);


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})