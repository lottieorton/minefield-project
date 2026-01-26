import Nav from '../components/Nav.js';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('Nav component', () => {    
    it('Renders the navigation links and Minesweep icon', () => {
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        //assert
        const icon = screen.getByAltText(/lottie's MineSweeper Icon/i);
        expect(screen.getByText(`Start a game`)).toBeInTheDocument();
        expect(screen.getByText(`Register`)).toBeInTheDocument();
        expect(screen.getByText(`Start a game 3`)).toBeInTheDocument();
        expect(screen.getByText(`Start a game 4`)).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', 'MinesweeperIcon.png');
    });

    it('Links you to the correct location', () => {
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        //assert
        const startGameLink = screen.getByRole('link', { name: `Start a game` }); //replace with /Start a game/i once you remove the other links
        const registerLink = screen.getByRole('link', { name: `Register` });
        const startGameLink3 = screen.getByRole('link', { name: `Start a game 3` });
        const startGameLink4 = screen.getByRole('link', { name: `Start a game 4` });
        expect(startGameLink).toHaveAttribute('href', '/game');
        expect(registerLink).toHaveAttribute('href', '/register');
        expect(startGameLink3).toHaveAttribute('href', '/game');
        expect(startGameLink4).toHaveAttribute('href', '/game');
    })
});