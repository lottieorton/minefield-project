import React from "react";
import { MemoryRouter } from "react-router-dom";
import { waitFor, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import ScoreCard from '../components/presentational/ScoreCard.js';

describe('renders component with prop values', () => {
    it('passes updated game scores via prop to ScoreCards', async () => {
        //arrange
        const game = {difficulty: "Easy", games: 3, wins: 2, losses: 1, 'wlratio': 67};
        //action
        const {container} = render(
            <MemoryRouter>
                <ScoreCard game={game} />
            </MemoryRouter>
        );
        screen.debug();
        //assert
        const gameDifficulty = await screen.findByText(game.difficulty);
        const gameWins = await container.querySelector('.game-wins');
        const gameLosses = await container.querySelector('.game-losses');
        const gameWLRatio = await container.querySelector('.game-wlratio');
        expect(gameDifficulty).toBeInTheDocument();
        expect(gameWins).toHaveTextContent(`Wins: ${game.wins}`);
        expect(gameLosses).toHaveTextContent(`Losses: ${game.losses}`);
        expect(gameWLRatio).toHaveTextContent(`W/L Ratio: ${game.wlratio}%`);
    });
});