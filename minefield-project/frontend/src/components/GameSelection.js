import React, { useState } from "react";
import Filter from "./Filter.js";
import GameBoard from "./presentational/GameBoard.js";
import "../styles/GameSelection.css";
import Rocket from "../imgs/Rocket.png";
import { createBoard } from "./functions/gameBoardCreation.js";
import { saveGame } from "./functions/saveGame.js";

export default function GameSelection() {
  const [gameDifficulty, setGameDifficulty] = useState("easy");
  const [completeGameBoard, setCompleteGameBoard] = useState([]);
  const [playingGameBoard, setPlayingGameBoard] = useState([]);
  const [boardRows, setBoardRows] = useState(0);
  const [boardCols, setBoardCols] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [numStars, setNumStars] = useState(0);

  const checkClickedValue = async (rowIndex, colIndex) => {
    if (completeGameBoard[rowIndex][colIndex] === "*") {
      setGameOver(true);
      saveGame(gameDifficulty, false);
    } else {
      let numCellsRemaining = -1;
      for (let i = 0; i < boardRows; i++) {
        for (let j = 0; j < boardCols; j++) {
          if (playingGameBoard[i][j] === null) {
            numCellsRemaining += 1;
          }
        }
      }
      if (numCellsRemaining === numStars) {
        setGameWon(true);
        saveGame(gameDifficulty, true);
      }
    }
  };

  const handleFilterChange = (newValue) => {
    setGameDifficulty(newValue);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setGameOver(false);
    setGameWon(false);
    const generatedBoard = createBoard(gameDifficulty);
    if (!generatedBoard) return;
    setCompleteGameBoard(generatedBoard);
    setPlayingGameBoard(generatedBoard.map((row) => row.map(() => null)));
    setBoardRows(generatedBoard.length);
    setBoardCols(generatedBoard[0].length);

    let count = 0;
    for (let i = 0; i < generatedBoard.length; i++) {
      for (let j = 0; j < generatedBoard[0].length; j++) {
        if (generatedBoard[i][j] === "*") {
          count++;
        }
      }
    }
    setNumStars(count);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    if (gameOver || gameWon || playingGameBoard[rowIndex][colIndex] !== null)
      return;
    // Creates a deep copy of the board so changes recognised by state
    const newBoard = playingGameBoard.map((row) => [...row]);

    const recursivelyReveal = (row, col) => {
      if (row < 0 || col < 0 || row >= boardRows || col >= boardCols) return;
      if (newBoard[row][col] !== null) return;
      const cellValue = completeGameBoard[row][col];
      newBoard[row][col] = cellValue;

      if (cellValue === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i !== 0 || j !== 0) {
              const newRow = row + i;
              const newCol = col + j;

              recursivelyReveal(newRow, newCol);
            }
          }
        }
      }
    };

    recursivelyReveal(rowIndex, colIndex);
    checkClickedValue(rowIndex, colIndex);
    setPlayingGameBoard(newBoard);
  };

  return (
    <>
      <section className="game-header-section">
        <img src={Rocket} alt="Rocket image" className="rocket-image" />
        <h2 className="game-header">Let's Start a Game</h2>
        <img src={Rocket} alt="Rocket image" className="rocket-image" />
      </section>
      <Filter onValueChange={handleFilterChange} />
      <div className="button-block">
        <button className="game-button" onClick={handleClick}>
          Start Game Now
        </button>
      </div>

      <GameBoard
        boardRows={boardRows}
        boardCols={boardCols}
        playingGameBoard={playingGameBoard}
        onCellClick={handleCellClick}
        gameOver={gameOver}
        gameWon={gameWon}
      />
    </>
  );
}
