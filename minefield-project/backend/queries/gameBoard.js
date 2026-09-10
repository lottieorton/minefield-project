const { createBoard } = require("../functions/game.js");

const createGameBoard = (req, res) => {
  try {
    const size = req.params.size;
    const board = createBoard(size);
    res.send(board);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = createGameBoard;
