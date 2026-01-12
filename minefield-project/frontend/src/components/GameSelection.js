import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Filter from './Filter.js';
import '../styles/GameSelection.css';
import Rocket from '../imgs/Rocket.png';


export default function GameSelection () {
    const navigate = useNavigate();
    const [gameDifficulty, setGameDifficulty] = useState('easy');
    const [completeGameBoard, setCompleteGameBoard] = useState([]);
    const [playingGameBoard, setPlayingGameBoard] = useState([]);
    const [boardRows, setBoardRows] = useState(0);
    const [boardCols, setBoardCols] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setgameWon] = useState(false);
    //const [numCellsToClear, setNumCellsToClear] = useState('');
    const [numStars, setNumStars] = useState(0);

    /* To be moved into a logic only file shortly */
    const checkClickedValue = (rowIndex, colIndex) => {
        if(completeGameBoard[rowIndex][colIndex] === "*") {
            setGameOver(true);
            //SAVE FAILURE TO DATABASE
        } else {
            let numCellsRemaining = -1;
            for (let i = 0; i < boardRows; i++) {
                for (let j = 0; j < boardCols; j++) {
                    if(playingGameBoard[i][j] === null) {
                        numCellsRemaining += 1;
                    }
                    console.log(`numRemain: ${numCellsRemaining}, cell:${i},${j}`);
                }
            };
            if(numCellsRemaining === numStars) {
                setgameWon(true);
                //SAVE WIN TO DATABASE
            }
            if(completeGameBoard[rowIndex][colIndex] === 0) {
                //then do similar check of all around to clear all other 0s, act as if handle click on them
            }
        }
    };

    /* Upto here */


    const handleFilterChange = (newValue) => {
        setGameDifficulty(newValue);
    };
    
    const handleClick = async (e) => {
        e.preventDefault();
        try {
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
            /*setPlayingGameBoard(Array(data.length * data[0].length).fill(null));*/
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
        }
    };

    const handleCellClick = (rowIndex, colIndex) => {
        console.log(`Clicked: ${rowIndex} + ${colIndex}`);
        if(gameOver || gameWon) return;
        setPlayingGameBoard(prevBoard => {
            return prevBoard.map((row, rIdx) => {
                if (rIdx !== rowIndex) return row;
                return row.map((cell, cIdx) => {
                    if (cIdx === colIndex) {
                        checkClickedValue(rowIndex, colIndex);
                        return completeGameBoard[rowIndex][colIndex];
                    }
                    return cell;
                })
            })
        })
    };

    return (
        <>            
            <section className='game-header-section'>
                <img src={Rocket} alt='Rocket image' className='rocket-image' />
                <h2 className='game-header'>Let's Start a Game</h2>
                <img src={Rocket} alt='Rocket image' className='rocket-image' />
            </section>
            <Filter onValueChange={handleFilterChange} />
            <button onClick={handleClick}>Start Game Now</button>

            {boardRows === 0 ? '' : <div className="grid-container">
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
            </div> : ''}


        </>
    )
};