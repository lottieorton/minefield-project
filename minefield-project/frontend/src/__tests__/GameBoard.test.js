import GameBoard from "../components/presentational/GameBoard.js";
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('GameBoard component', () => {
    it('renders the board grid', () => {
        //arrange
        render(
            <GameBoard 
                boardRows={5}
                boardCols={5} 
                playingGameBoard={[
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]]
                }
                onCellClick={() => {}}
                gameOver={false}
                gameWon={false} />
        );
        //assert
        //screen.debug();
        const board = screen.getByRole('grid', { name: /minesweeper board/i });
        const firstCell = screen.getByTestId('cell-0-0');
        const lastCell = screen.getByTestId('cell-4-4');
        expect(board).toBeInTheDocument();
        expect(firstCell).toBeInTheDocument();
        expect(lastCell).toBeInTheDocument();
    });

    it('if the board is empty renders nothing', () => {
        //arrange
        render(
            <GameBoard 
                boardRows={0}
                boardCols={0} 
                playingGameBoard={[]}
                onCellClick={() => {}}
                gameOver={false}
                gameWon={false} />
        );
        //assert
        //screen.debug();
        const board = screen.queryByRole('grid', { name: /minesweeper board/i });
        expect(board).not.toBeInTheDocument();
    });

    it('calls onCellClick when a cell is clicked', () => {
        //arrange
        const mockOnCellClick = jest.fn();

        render(
            <GameBoard 
                boardRows={5}
                boardCols={5} 
                playingGameBoard={[
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]]
                }
                onCellClick={mockOnCellClick}
                gameOver={false}
                gameWon={false} />
        );
        //action
        //screen.debug();
        const firstCell = screen.getByTestId('cell-0-0');
        fireEvent.click(firstCell);
        //assert
        expect(mockOnCellClick).toHaveBeenCalled();
        expect(mockOnCellClick).toHaveBeenCalledWith(0,0);
    });

    it('updates class and prints cell value correctly and for null sets as blank', () => {
        //arrange
        const mockOnCellClick = jest.fn();

        render(
            <GameBoard 
                boardRows={5}
                boardCols={5} 
                playingGameBoard={[
                    [null, 1, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]]
                }
                onCellClick={mockOnCellClick}
                gameOver={false}
                gameWon={false} />
        );
        //action
        //screen.debug();
        const firstCell = screen.getByTestId('cell-0-0');
        const secondCell = screen.getByTestId('cell-0-1');
        //assert
        expect(firstCell).toHaveTextContent("");
        expect(firstCell).toHaveClass("cell ");
        expect(secondCell).toHaveTextContent(1);
        expect(secondCell).toHaveClass("cell revealed");
    })
    
    it('prints message if gameOver', () => {
        //arrange
        render(
            <GameBoard 
                boardRows={5}
                boardCols={5} 
                playingGameBoard={[
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]]
                }
                onCellClick={() => {}}
                gameOver={true}
                gameWon={false} />
        );
        //assert
        //screen.debug();
        expect(screen.queryByText(/Congrats, you discovered all the mines!/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Unfortunate, good try!/i));
    });

    it('prints message if GameWon', () => {
        //arrange
        render(
            <GameBoard 
                boardRows={5}
                boardCols={5} 
                playingGameBoard={[
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]]
                }
                onCellClick={() => {}}
                gameOver={false}
                gameWon={true} />
        );
        //assert
        //screen.debug();
        expect(screen.getByText(/Congrats, you discovered all the mines!/i)).toBeInTheDocument();
        expect(screen.queryByText(/Unfortunate, good try!/i)).not.toBeInTheDocument();
    });
})