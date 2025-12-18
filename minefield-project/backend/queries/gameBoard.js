//const express = require('express');
const { createBoard } = require('../functions/game.js');

const createGameBoard = (req, res, next) => {
    try {
        const size = req.params.size;
        console.log(`Size ${size}`);
        const board = createBoard(size);
        console.log(`board ${board}`);
        res.send(board);
    } catch (error) {
        console.error("Failed to generate gane board:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = createGameBoard;