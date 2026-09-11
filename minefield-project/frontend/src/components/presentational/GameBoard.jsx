import React from "react";

export default function GameBoard ({boardRows, boardCols, playingGameBoard, onCellClick, gameOver, gameWon}) {
    return (
        <>
            {boardRows === 0 ? '' : <div className="grid-container">
                <div 
                    role="grid"
                    aria-label="Minesweeper Board"
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
                                data-testid={`cell-${rowIndex}-${colIndex}`} 
                                className={`cell ${cellValue !== null ? 'revealed' : ''}`}
                                onClick={() => onCellClick(rowIndex, colIndex)}
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
}