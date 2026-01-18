import { createBoard } from '../components/functions/gameBoardCreation.js';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('createBoard function', () => {
    const calcNumStars = (board) => {
        let numStars = 0;
        board.forEach(row => {
            row.forEach(cell => {
                if(cell === "*") numStars += 1;
            })
        });
        return numStars
    };
    
    it('creates correct board and star nums for easy option', () => {
        //action
        const board = createBoard('easy');
        const stars = calcNumStars(board);
        //assert
        expect(board.length).toBe(5);
        expect(board[0].length).toBe(5);
        expect(stars).toBe(3);
    });

    it('creates correct board and star nums for medium option', () => {
        //action
        const board = createBoard('medium');
        const stars = calcNumStars(board);
        //assert
        expect(board.length).toBe(10);
        expect(board[0].length).toBe(10);
        expect(stars).toBe(7);
    });

    it('creates correct board and star nums for hard option', () => {
        //action
        const board = createBoard('hard');
        const stars = calcNumStars(board);
        //assert
        expect(board.length).toBe(15);
        expect(board[0].length).toBe(15);
        expect(stars).toBe(10);
    });

    it('returns null if the entry option isnt correct', () => {
        //action
        const message = createBoard('a');
        //assert
        expect(message).toBe(null);
    });

    it('forcibly trials setting 2 stars to the same location', () => {
        //arrange
        jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // Row 0
        .mockReturnValueOnce(0.1) // Col 0
        .mockReturnValueOnce(0.1) // Row 0 (Collision)
        .mockReturnValueOnce(0.1) // Col 0 (Collision)
        .mockReturnValueOnce(0.4) // Row 2
        .mockReturnValueOnce(0.4); // Col 2
        //action
        const board = createBoard('easy');
        const stars = calcNumStars(board);
        //assert
        expect(stars).toBe(3);
        Math.random.mockRestore();
    });

    
    
    /*it('correctly calc.s no.s of stars touching', () => {
        const checkNum = (board) => {

    
        }
    })*/
})