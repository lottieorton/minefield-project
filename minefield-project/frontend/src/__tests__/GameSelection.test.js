import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';

jest.mock('../components/functions/gameBoardCreation.js', () => ({
    createBoard: jest.fn()
}));

jest.mock('../components/Filter.js', () => {
    return function MockedFilter(props) {
        return (
            <div data-testid="mock-filter">
                <span data-testid="mock-filter-props">
                    ValueChangeProp: {props.onValueChange}
                </span>
                <select aria-label="mock-filter" id="gameChoices" name="gameChoices" onChange={(e) => props.onValueChange(e.target.value)}>
                    <option value="easy" >Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>
        )
    }
});

const mockGameBoardComponent = jest.fn();
jest.mock('../components/presentational/GameBoard.js', () => { 
    return function MockedGameBoard(props) { 
        return mockGameBoardComponent(props); 
    }; 
});

jest.mock('../components/functions/saveGame.js', () => ({saveGame: jest.fn()}))

import GameSelection from "../components/GameSelection.js";
const { createBoard } = require('../components/functions/gameBoardCreation.js');
const { saveGame } = require('../components/functions/saveGame.js');

describe('checkClickedValue logic', () => {
    beforeEach(() => {
        mockGameBoardComponent.mockImplementation((props) => (
            <div data-testid="mock-game-board">
                    <span data-testid="mock-props">
                        RowProp: {props.boardRows} | ColProp: {props.boardCols} | PlayingBoardProp: {String(props.playingGameBoard)} | CellClickProp: {props.onCellClick} | GameOverProp: {String(props.gameOver)} | GameWonProp: {String(props.gameWon)}
                    </span>
                    <button data-testid="mock-mine-click" onClick={() => props.onCellClick(0,0)}>
                        Click Mine
                    </button>
                    <button data-testid="mock-cell-0-1-click" onClick={() => props.onCellClick(0,1)}>
                        Click Cell 0-1
                    </button>
                    <button data-testid="mock-cell-1-0-click" onClick={() => props.onCellClick(1,0)}>
                        Click Cell 1-0
                    </button>
                    <button data-testid="mock-cell-1-1-click" onClick={() => props.onCellClick(1,1)}>
                        Click Cell 1-1
                    </button>
            </div>
        ))
    });

    const createTestGame = () => {
        const mockBoard = [
            ['*', 1],
            [1, 1]
        ];

        createBoard.mockReturnValue(mockBoard);

        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );

        //Click Start Game button
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton);
    };

    it('updates gameOver to true if mine clicked', async () => {
        //arrange
        createTestGame();
        const mockSavedScore = [{
            game_id: 1,
            user_id: 1,
            difficulty: "easy",
            win: false
        }]
        saveGame.mockReturnValue(mockSavedScore);
        //action
        const mineButton = screen.getByRole('button', { name: /click mine/i });
        fireEvent.click(mineButton);
        //screen.debug();
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/gameoverprop: true/i);
        expect(saveGame).toHaveBeenCalledWith('easy', false);
        //clean up
        saveGame.mockRestore();
    });

    it('correctly sets gameWon = true when all correct cells are clicked', async () => {
        //arrange
        createTestGame();
        const mockSavedScore = [{
            game_id: 1,
            user_id: 1,
            difficulty: "easy",
            win: true
        }]
        saveGame.mockReturnValue(mockSavedScore);
        //action
        const cell01 = screen.getByRole('button', { name: /click cell 0-1/i });
        const cell10 = screen.getByRole('button', { name: /click cell 1-0/i });
        const cell11 = screen.getByRole('button', { name: /click cell 1-1/i });
        fireEvent.click(cell01);
        fireEvent.click(cell10);
        fireEvent.click(cell11);
        //screen.debug();
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/gamewonprop: true/i);
        expect(gameBoard).toHaveTextContent(/gameoverprop: false/i);
        expect(saveGame).toHaveBeenCalledWith('easy', true);
        //clean up
        saveGame.mockRestore();
    })
     
    //NON-CORRECTLY MOCKED TESTS -- MORE END TO END TEST
    /*it('sets gameOver to true if a mine is a clicked', () => {
        //arrange
        createTestGame();
        //action
        const mineCell = screen.getByTestId('cell-0-0');
        fireEvent.click(mineCell);
        //assert
        expect(screen.queryByText(/Congrats, you discovered all the mines!/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Unfortunate, good try!/i));
    });*/

    /*it('correctly sets gameWon = true when all correct cells are clicked, otherwise gameOver and gameWon remain false', () => {
        //arrange
        createTestGame();
        //action
        const clickNumCell1 = screen.getByTestId('cell-0-1');
        fireEvent.click(clickNumCell1);
        expect(screen.queryByText(/Unfortunate, good try!/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Congrats, you discovered all the mines!/i)).not.toBeInTheDocument();
        const clickNumCell2 = screen.getByTestId('cell-1-0');
        fireEvent.click(clickNumCell2);
        expect(screen.queryByText(/Unfortunate, good try!/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Congrats, you discovered all the mines!/i)).not.toBeInTheDocument();
        const clickNumCell3 = screen.getByTestId('cell-1-1');
        fireEvent.click(clickNumCell3);
        expect(screen.queryByText(/Unfortunate, good try!/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Congrats, you discovered all the mines!/i)).toBeInTheDocument();
    });*/
});

describe('Check handleFilterChange logic', () => {
    const createTestGame = () => {
        const mockBoard = [
            ['*', 1],
            [1, 1]
        ];
    
        createBoard.mockReturnValue(mockBoard);

        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );
    };

    it('sets the gameDifficulty to easy with default filter option and calls createBoard', () => {
        //arrange
        createTestGame();
        //action
        //screen.debug();
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton);
        
        //fireEvent.change(filter, { target: {value: 'medium'} });
        //assert
        expect(createBoard).toHaveBeenCalledWith("easy");
    });

    it('sets the gameDifficulty to the new selected option', () => {
        //arrange
        createTestGame();
        //action
        //screen.debug();
        const filter = screen.getByRole('combobox', {name: /mock-filter/i});
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.change(filter, { target: {value: 'medium'} });
        fireEvent.click(startGameButton);
        //assert
        expect(createBoard).toHaveBeenCalledWith("medium");
    })

    //NOT CORRECTLY MOCKED TEST MORE END TO END TEST -- AND expect(filter... is wrong not testing the state update
    /*it('sets the gameDifficulty to the new selected option', () => {
        //arrange
        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );
        //action
        const filter = screen.getByRole('combobox');
        //checks the original value is 'easy'
        expect(filter.value).toBe('easy');
        fireEvent.change(filter, { target: {value: 'medium'} });
        //assert
        expect(filter.value).toBe('medium');
    })*/
});

describe('Check handleClick logic', () => {
    beforeEach(() => {
        mockGameBoardComponent.mockImplementation((props) => (
            <div data-testid="mock-game-board">
                    <span data-testid="mock-props">
                        RowProp: {props.boardRows} | ColProp: {props.boardCols} | PlayingBoardProp: {String(props.playingGameBoard)} | CellClickProp: {props.onCellClick} | GameOverProp: {String(props.gameOver)} | GameWonProp: {String(props.gameWon)}
                    </span>
                    <button data-testid="mock-mine-click" onClick={() => props.onCellClick(0,0)}>
                        Click Mine
                    </button>
                    <button data-testid="mock-cell-0-1-click" onClick={() => props.onCellClick(0,1)}>
                        Click Cell 0-1
                    </button>
                    <button data-testid="mock-cell-1-0-click" onClick={() => props.onCellClick(1,0)}>
                        Click Cell 1-0
                    </button>
                    <button data-testid="mock-cell-1-1-click" onClick={() => props.onCellClick(1,1)}>
                        Click Cell 1-1
                    </button>
            </div>
        ))
    });

    const createTestGame = () => {
        const mockBoard = [
            ['*', 1],
            [1, 1]
        ];
    
        createBoard.mockReturnValue(mockBoard);

        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );
    };

    //'calls createBoard with the filter value' -- ALREADY TESTED ABOVE

    it('passes row, col, playingGameBoard values to GameBoard', async () => {
        //arrange
        createTestGame();
        //action
        //Click Start Game button
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton); 
        //screen.debug();      
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toBeInTheDocument();
        expect(gameBoard).toHaveTextContent('RowProp: 2 | ColProp: 2');
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,,,');
    });

    //'completeGameBoard' value -- ALREADY TESTED ABOVE
    //'numStars' value -- ALREADY TESTED ABOVE

    it('returns nothing if there is an issue generating a board', async () => {
        //arrange
        const mockCreateBoardError = null;  
        createBoard.mockReturnValue(mockCreateBoardError);

        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );
        //action
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton); 
        //screen.debug();      
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/playingboardprop: |/i);
    })

    // NOT CORRECTLY MOCKED TEST
    /*it('calls createBoard with the filter value, and creates a board of correct cell length', () => {
        //arrange
        createTestGame();
        //action
        //Click Start Game button
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton);        
        const numCell = screen.getByTestId('cell-0-1');
        expect(numCell).not.toHaveClass(/revealed/i);
        expect(numCell).toHaveTextContent("");
        fireEvent.click(numCell);
        //assert
        expect(createBoard).toHaveBeenCalled();
        expect(createBoard).toHaveBeenCalledWith('easy');
        expect(numCell).toHaveTextContent(1);
    });*/
});

describe('Check handleCellClick logic', () => {
    beforeEach(() => {
        mockGameBoardComponent.mockImplementation((props) => (
            <div data-testid="mock-game-board">
                    <span data-testid="mock-props">
                        RowProp: {props.boardRows} | ColProp: {props.boardCols} | PlayingBoardProp: {String(props.playingGameBoard)} | CellClickProp: {props.onCellClick} | GameOverProp: {String(props.gameOver)} | GameWonProp: {String(props.gameWon)}
                    </span>
                    <button data-testid="mock-mine-click" onClick={() => props.onCellClick(0,0)}>
                        Click Mine
                    </button>
                    <button data-testid="mock-cell-0-1-click" onClick={() => props.onCellClick(0,1)}>
                        Click Cell 0-1
                    </button>
                    <button data-testid="mock-cell-1-0-click" onClick={() => props.onCellClick(1,0)}>
                        Click Cell 1-0
                    </button>
                    <button data-testid="mock-cell-1-1-click" onClick={() => props.onCellClick(1,1)}>
                        Click Cell 1-1
                    </button>
            </div>
        ))
    });

    const createTestGame = () => {
        const mockBoard = [
            ['*', 1],
            [1, 1]
        ];
    
        createBoard.mockReturnValue(mockBoard);

        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );

        //Click Start Game button
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton);
    };

    it('if gameOver is true, check subsequent clicks aren`t counted', async () => {
        //arrange
        createTestGame();
        const mockSavedScore = [{
            game_id: 1,
            user_id: 1,
            difficulty: "easy",
            win: false
        }]
        saveGame.mockReturnValue(mockSavedScore);
        //action
        const mineButton = screen.getByRole('button', { name: /click mine/i });
        fireEvent.click(mineButton);
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/gameoverprop: true/i);
        const cell01 = screen.getByRole('button', { name: /click cell 0-1/i });
        fireEvent.click(cell01);
        //screen.debug();
        //assert
        await waitFor(() => {
            expect(saveGame).toHaveBeenCalledTimes(1);
            expect(saveGame).toHaveBeenCalledWith('easy', false);
            expect(gameBoard).toHaveTextContent('PlayingBoardProp: *,,,');
        });
        //clean up
        saveGame.mockRestore();
    });

    it('if gameWon is true, check subsequent clicks aren`t counted', async () => {
        //arrange
        createTestGame();
        const mockSavedScore = [{
            game_id: 1,
            user_id: 1,
            difficulty: "easy",
            win: true
        }]
        saveGame.mockReturnValue(mockSavedScore);
        //action
        const cell01 = screen.getByRole('button', { name: /click cell 0-1/i });
        const cell10 = screen.getByRole('button', { name: /click cell 1-0/i });
        const cell11 = screen.getByRole('button', { name: /click cell 1-1/i });
        const mineButton = screen.getByRole('button', { name: /click mine/i });
        fireEvent.click(cell01);
        fireEvent.click(cell10);
        fireEvent.click(cell11);
        fireEvent.click(mineButton);
        //screen.debug();
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/gamewonprop: true/i);
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,1,1,1');
        expect(saveGame).toHaveBeenCalledTimes(1);
        expect(saveGame).toHaveBeenCalledWith('easy', true);
        //clean up
        saveGame.mockRestore();
    });

    it('updates playingGameBoard when a cell with a number > 0 is clicked and game is still ongoing', async () => {
        //arrange
        createTestGame();
        //action
        const cell01 = screen.getByRole('button', { name: /click cell 0-1/i });
        fireEvent.click(cell01);
        //screen.debug();
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,1,,');
        expect(gameBoard).toHaveTextContent(/gamewonprop: false/i);
        expect(gameBoard).toHaveTextContent(/gameoverprop: false/i);
    });

    it('starting a new game resets gameWon', async () => {
        //arrange
        createTestGame();
        const mockSavedScore = [{
            game_id: 1,
            user_id: 1,
            difficulty: "easy",
            win: true
        }]
        saveGame.mockReturnValue(mockSavedScore);
        //action
        const cell01 = screen.getByRole('button', { name: /click cell 0-1/i });
        const cell10 = screen.getByRole('button', { name: /click cell 1-0/i });
        const cell11 = screen.getByRole('button', { name: /click cell 1-1/i });
        const startGameButton = screen.getByRole('button', { name: /start game now/i });
        fireEvent.click(cell01);
        fireEvent.click(cell10);
        fireEvent.click(cell11);
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/gamewonprop: true/i);
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,1,1,1');
        fireEvent.click(startGameButton);
        //screen.debug();
        //assert
        expect(gameBoard).toHaveTextContent(/gamewonprop: false/i);
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,,,');
        //clean up
        saveGame.mockRestore();
    });

    it('starting a new game resets gameOver', async () => {
        //arrange
        createTestGame();
        const mockSavedScore = [{
            game_id: 1,
            user_id: 1,
            difficulty: "easy",
            win: false
        }];
        saveGame.mockReturnValue(mockSavedScore);
        //action
        const mineCell = screen.getByRole('button', { name: /click mine/i });
        const startGameButton = screen.getByRole('button', { name: /start game now/i });
        fireEvent.click(mineCell);
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent(/gameoverprop: true/i);
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: *,,,');
        fireEvent.click(startGameButton);
        //screen.debug();
        //assert
        expect(gameBoard).toHaveTextContent(/gameoverprop: false/i);
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,,,');
    });

    it('if a 0 is clicked, all 0s and surrounding cells are recursively uncovered', async () => {
        //arrange
        mockGameBoardComponent.mockImplementation((props) => (
            <div data-testid="mock-game-board">
                <span data-testid="mock-props">
                    RowProp: {props.boardRows} | ColProp: {props.boardCols} | PlayingBoardProp: {String(props.playingGameBoard)} | CellClickProp: {props.onCellClick} | GameOverProp: {String(props.gameOver)} | GameWonProp: {String(props.gameWon)}
                </span>
                <button data-testid="mock-cell-0-0-click" onClick={() => props.onCellClick(0,0)}>
                    Click Cell 0-0
                </button>
                <button data-testid="mock-mine-1-click" onClick={() => props.onCellClick(0,1)}>
                    Click Mine 1
                </button>
                <button data-testid="mock-cell-0-2-click" onClick={() => props.onCellClick(0,2)}>
                    Click Cell 0-2
                </button>
                <button data-testid="mock-cell-0-3-click" onClick={() => props.onCellClick(0,3)}>
                    Click Cell 0-3
                </button>
                <button data-testid="mock-mine-2-click" onClick={() => props.onCellClick(1,0)}>
                    Click Mine 2
                </button>
                <button data-testid="mock-cell-1-1-click" onClick={() => props.onCellClick(1,1)}>
                    Click Cell 1-1
                </button>
                <button data-testid="mock-cell-1-2-click" onClick={() => props.onCellClick(1,2)}>
                    Click Cell 1-2
                </button>
                <button data-testid="mock-cell-1-3-click" onClick={() => props.onCellClick(1,3)}>
                    Click Cell 1-3
                </button>
                <button data-testid="mock-cell-2-0-click" onClick={() => props.onCellClick(2,0)}>
                    Click Cell 2-0
                </button>
                <button data-testid="mock-cell-2-1-click" onClick={() => props.onCellClick(2,1)}>
                    Click Cell 2-1
                </button>
                <button data-testid="mock-cell-2-2-click" onClick={() => props.onCellClick(2,2)}>
                    Click Cell 2-2
                </button>
                <button data-testid="mock-cell-2-3-click" onClick={() => props.onCellClick(2,3)}>
                    Click Cell 2-3
                </button>
                <button data-testid="mock-cell-3-0-click" onClick={() => props.onCellClick(3,0)}>
                    Click Cell 3-0
                </button>
                <button data-testid="mock-cell-3-1-click" onClick={() => props.onCellClick(3,1)}>
                    Click Cell 3-1
                </button>
                <button data-testid="mock-cell-3-2-click" onClick={() => props.onCellClick(3,2)}>
                    Click Cell 3-2
                </button>
                <button data-testid="mock-cell-3-3-click" onClick={() => props.onCellClick(3,3)}>
                    Click Cell 3-3
                </button>
            </div>
        ));
        
        const mockBoard = [
            [2, '*', 1, 0],
            ['*', 2, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ];
        const postClickMockBoard = [
            ['', '', 1, 0],
            ['', 2, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ];
        createBoard.mockReturnValue(mockBoard);
        render(
            <MemoryRouter>
                <GameSelection />
            </MemoryRouter>
        );
        //Click Start Game button
        const startGameButton = screen.getByText(/Start Game Now/i);
        fireEvent.click(startGameButton);
        //action
        const cell03 = screen.getByRole('button', { name: /click cell 0-3/i });
        fireEvent.click(cell03);
        //screen.debug();
        //assert
        const gameBoard = await screen.findByTestId('mock-game-board');
        expect(gameBoard).toHaveTextContent('PlayingBoardProp: ,,1,0,,2,1,0,1,1,0,0,0,0,0,0');
    });
});