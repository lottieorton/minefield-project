import React from "react";
import { MemoryRouter } from "react-router-dom";
import { waitFor, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import ScorePage from "../components/ScorePage";

jest.mock('../components/presentational/ScoreCard.js', () => {
    return function MockedScoreCard(props) {
        const game = props.game;
        return (
            <div data-testid={"mock-game-card" + game.difficulty} className='score-card' key={game.id + game.difficulty}>
                {game.difficulty}: Wins: {game.wins}. Losses: {game.losses}. W/L Ratio: {game.wlratio}%
            </div>
        )
    }
});

import ScoreCard from '../components/presentational/ScoreCard.js';

describe('fetches users score', () => {
    const testScores = [
        {difficulty: "easy", games: 3, wins: 2, losses: 1, 'wlratio': 67},
        {difficulty: "medium", games: 1, wins: 1, losses: 0, 'wlratio': 100}
    ];

    const finalScores = [
        {difficulty: "Easy", games: 3, wins: 2, losses: 1, 'wlratio': 67},
        {difficulty: "Medium", games: 1, wins: 1, losses: 0, 'wlratio': 100},
        {difficulty: "Hard", games: 0, wins: 0, losses: 0, 'wlratio': 0}
    ];

    it('passes updated game scores via prop to ScoreCards', async () => {
        //arrange
        //mocking the API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => testScores,
        });
        
        //action
        render(
            <MemoryRouter>
                <ScorePage />
            </MemoryRouter>
        );
        //screen.debug();
        //assert
        await waitFor(() => {
            const easyCard = screen.getByTestId('mock-game-cardEasy');
            const mediumCard = screen.getByTestId('mock-game-cardMedium');
            const hardCard = screen.getByTestId('mock-game-cardHard');
            expect(easyCard).toHaveTextContent(`${finalScores[0].difficulty}: Wins: ${finalScores[0].wins}. Losses: ${finalScores[0].losses}. W/L Ratio: ${finalScores[0].wlratio}%`); 
            expect(mediumCard).toHaveTextContent(`${finalScores[1].difficulty}: Wins: ${finalScores[1].wins}. Losses: ${finalScores[1].losses}. W/L Ratio: ${finalScores[1].wlratio}%`);     
            expect(hardCard).toHaveTextContent(`${finalScores[2].difficulty}: Wins: ${finalScores[2].wins}. Losses: ${finalScores[2].losses}. W/L Ratio: ${finalScores[2].wlratio}%`);  
        });
    });

    it('if !response.ok handles error', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        //mocking the API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: () => { message: "Internal Server Error" }
        });
        //action
        render(
            <MemoryRouter>
                <ScorePage />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Score fetching error:',
                'Scores request failed. Please try refreshing the page.'
            );
        });
        //clean up
        consoleSpy.mockRestore();
    });
});