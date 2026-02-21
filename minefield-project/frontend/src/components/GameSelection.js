import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Filter from './Filter.js';
import GameBoard from './presentational/GameBoard.js';
import '../styles/GameSelection.css';
import Rocket from '../imgs/Rocket.png';
import { createBoard } from './functions/gameBoardCreation.js';
import { saveGame } from './functions/saveGame.js';

export default function GameSelection () {
    const navigate = useNavigate();
    const [gameDifficulty, setGameDifficulty] = useState('easy');
    const [completeGameBoard, setCompleteGameBoard] = useState([]);
    const [playingGameBoard, setPlayingGameBoard] = useState([]);
    const [boardRows, setBoardRows] = useState(0);
    const [boardCols, setBoardCols] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [numStars, setNumStars] = useState(0);
    
    const checkClickedValue = async (rowIndex, colIndex) => {
        if(completeGameBoard[rowIndex][colIndex] === "*") {
            setGameOver(true);
            saveGame(gameDifficulty, false);
        } else {
            let numCellsRemaining = -1;
            for (let i = 0; i < boardRows; i++) {
                for (let j = 0; j < boardCols; j++) {
                    if(playingGameBoard[i][j] === null) {
                        numCellsRemaining += 1;
                    }
                    //console.log(`numRemain: ${numCellsRemaining}, cell:${i},${j}`);
                }
            };
            if(numCellsRemaining === numStars) {
                setGameWon(true);
                saveGame(gameDifficulty, true);
            }
            /*if(completeGameBoard[rowIndex][colIndex] === 0) {
                //then do similar check of all around to clear all other 0s, act as if handle click on them
            }*/
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
        if(!generatedBoard) return;
        setCompleteGameBoard(generatedBoard);
        setPlayingGameBoard(generatedBoard.map(row => row.map(() => null)));
        setBoardRows(generatedBoard.length);
        setBoardCols(generatedBoard[0].length);

        //PASS THE VALUE STRAIGHT FROM FUNCTION??
        let count = 0;
        for (let i = 0; i < generatedBoard.length; i++) {
            for (let j = 0; j < generatedBoard[0].length; j++) {
                if(generatedBoard[i][j] === "*") {
                    //setNumStars(prev => prev + 1);
                    count++;
                }
                //console.log(`numStars: ${numStars}, cell:${i},${j}`);
            }
        };
        setNumStars(count);

        //LOGIC FOR BACKEND PULLING OF GAME
        /*try {
            const response = await fetch(`${API_BASE_URL}/gameBoard/createBoard/${gameDifficulty}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }

            const data = await response.json();
            setCompleteGameBoard(data);
            setPlayingGameBoard(data.map(row => row.map(() => null)));
            setBoardRows(data.length);
            setBoardCols(data[0].length);

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[0].length; j++) {
                    if(data[i][j] === "*") {
                        setNumStars(prev => prev + 1);
                    }
                    console.log(`numStars: ${numStars}, cell:${i},${j}`);
                }
            };
            //setNumCellsToClear((boardRows * boardCols) - numStars);

            console.log('gameboard: ' + JSON.stringify(data));
        } catch (error) {
            console.error('Create board error:', error.message);
        }*/
    };

    const handleCellClick = (rowIndex, colIndex) => {
        // console.log(`Clicked: ${rowIndex} + ${colIndex}`);
        // if(gameOver || gameWon) return;
        console.log(`cell handleCellClicked: ${rowIndex} ${colIndex}`);
        if(gameOver || gameWon || playingGameBoard[rowIndex][colIndex] !== null) return;
        //creates a deep copy of the board so changes recognised by state
        const newBoard = playingGameBoard.map(row => [...row]);

        const recursivelyReveal = (row, col) => {
            if(row < 0 || col < 0 || row >= boardRows || col >= boardCols) return;
            if(newBoard[row][col] !== null) return;
            const cellValue = completeGameBoard[row][col];
            newBoard[row][col] = cellValue;
            console.log('newBoard:' + newBoard);
            
            if(cellValue === 0) {
                for(let i = -1; i <= 1; i++) {
                    for(let j = -1; j <= 1; j++) {
                        if(i !== 0 || j !== 0) {
                            const newRow = row + i;
                            const newCol = col + j;
                            console.log(`new cell: ${newRow} ${newCol}`);
                            recursivelyReveal(newRow, newCol);
                        }
                    }                    
                }
            }
        };
        
        recursivelyReveal(rowIndex, colIndex);

        // if(completeGameBoard[rowIndex][colIndex] === 0) {
        //     for(let i = -1; i <= 1; i++) {
        //         for(let j = -1; j <= 1; j++) {
        //             const newRowIndex = rowIndex + i;
        //             const newColIndex = colIndex + j;
        //             console.log(`new cell: ${newRowIndex} ${newColIndex}`);
        //             if(newRowIndex >= 0 && newColIndex >= 0 && newRowIndex < boardRows && newColIndex < boardCols && (i !== 0 || j !== 0)) {
        //                 console.log(`new cell checked: ${newRowIndex} ${newColIndex}`);
        //                 handleCellClick(newRowIndex, newColIndex);
        //             }                    
        //         }
        //     }
        // };


        checkClickedValue(rowIndex, colIndex);
        // setPlayingGameBoard(prevBoard => {
        //     return prevBoard.map((row, rIdx) => {
        //         console.log('update board');
        //         if (rIdx !== rowIndex) return row;
        //         return row.map((cell, cIdx) => {
        //             if (cIdx === colIndex) {
        //                 return completeGameBoard[rowIndex][colIndex];
        //             }
        //             return cell;
        //         })
        //     })
        // })

        // const valClickedCell = completeGameBoard[rowIndex][colIndex];
        // const newPlayingGameBoard = playingGameBoard;
        // newPlayingGameBoard[rowIndex][colIndex] = valClickedCell;
        setPlayingGameBoard(newBoard);

    };

    return (
        <>            
            <section className='game-header-section'>
                <img src={Rocket} alt='Rocket image' className='rocket-image' />
                <h2 className='game-header'>Let's Start a Game</h2>
                <img src={Rocket} alt='Rocket image' className='rocket-image' />
            </section>
            <Filter onValueChange={handleFilterChange} />
            <div className='button-block'>
                <button className='game-button' onClick={handleClick}>Start Game Now</button>
            </div>

            <GameBoard boardRows={boardRows} boardCols={boardCols} playingGameBoard={playingGameBoard} onCellClick={handleCellClick} gameOver={gameOver} gameWon={gameWon} />
            {/*boardRows === 0 ? '' : <div className="grid-container">
                <div 
                    className="mine-grid" 
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${boardCols}, 30px)`, // creates 'cols' number of columns
                        gridTemplateRows: `repeat(${boardRows}, 30px)`,    // creates 'rows' number of rows
                        gap: '2px'
                    }}
                >
                    {playingGameBoard.map((row, rowIndex) => (
                        row.map((cellValue, colIndex) => (
                            <div 
                                key={`${rowIndex}-${colIndex}`} 
                                className={`cell ${cellValue !== null ? 'revealed' : ''}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                                {cellValue !== null ? cellValue : ""}
                            </div>
                        ))
                    ))}
                </div>
            </div>}

            {gameOver ? <div>
                <p>Unfortunate, good try! Better luck next time!</p>
            </div> : ''}

            {gameWon ? <div>
                <p>Congrats, you discovered all the mines!</p>
            </div> : ''*/}


        </>
    )
};