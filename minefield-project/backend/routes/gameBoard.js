const express = require('express');
const gameBoardRouter = express.Router();
const createGameBoard = require('../queries/gameBoard.js');

gameBoardRouter.get('/createBoard/:size', createGameBoard);

module.exports = gameBoardRouter;