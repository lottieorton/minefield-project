import React from "react";
import { MemoryRouter } from "react-router-dom";
import { waitFor, render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import Nav from "../components/Nav.js";

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigateFunction
}));

describe('checks user logged in status', () => {
    it('makes an API call to check if user logged in', async () => {
        //arrange
        const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ isLoggedIn: true }),
        });
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/user/loggedInStatus'),
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        fetchSpy.mockRestore();
    });

    it('renders logout button if user logged in', async () => {
        //arrange
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ isLoggedIn: true }),
        });
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        //assert
        const logoutButton = await screen.findByRole('button', { name: /logout/i });
        //screen.debug();
        expect(logoutButton).toBeInTheDocument();
    });

    it('!response.ok throws an error message', async () => {
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
                <Nav />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Login status fetching error:',
                'Logged in status request failed.'
            );
        });
        //clean up
        consoleSpy.mockRestore();
    });

    it('handles a database call error', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        //mocking the API call
        global.fetch = jest.fn().mockRejectedValue(new Error('Login check error'));
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Login status fetching error:',
                'Login check error'
            );
        });
        //clean up
        consoleSpy.mockRestore();
    })
});

describe('Check handleClick logic', () => {
    it('calls the /logout API endpoint', async () => {
        //arrange
        const fetchSpy = jest.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isLoggedIn: true }),
        })
        .mockResolvedValueOnce({
            ok: true,
        });
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        const logoutButton = await screen.findByRole('button', {name: /logout/i});
        fireEvent.click(logoutButton); 
        //assert
        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(2);         
            expect(fetchSpy).toHaveBeenNthCalledWith(1,
                expect.stringContaining('/user/loggedInStatus'),
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(fetchSpy).toHaveBeenNthCalledWith(2,
                expect.stringContaining('/logout'),
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        fetchSpy.mockRestore();  
    });

    it('navigates to / on successful logout', async () => {
        //arrange
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isLoggedIn: true }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Successfully logged out' }),
        });
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        const logoutButton = await screen.findByRole('button', {name: /logout/i});
        fireEvent.click(logoutButton); 
        //assert
        await waitFor(() => 
            expect(mockNavigateFunction).toHaveBeenCalledWith('/')
        ); 
    });

    it('handles error message for !response.ok', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isLoggedIn: true }),
        })
        .mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Error logging out' }),
        });
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        const logoutButton = await screen.findByRole('button', {name: /logout/i});
        fireEvent.click(logoutButton); 
        //assert
        await waitFor(() => 
            expect(consoleSpy).toHaveBeenCalledWith(
                'Log out error:',
                'Logged out request failed.'
            )
        ); 
    });

    it('handles error message for API call error', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ isLoggedIn: true }),
        })
        .mockRejectedValueOnce(new Error('Logout API error'));
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        const logoutButton = await screen.findByRole('button', {name: /logout/i});
        fireEvent.click(logoutButton); 
        //assert
        await waitFor(() => 
            expect(consoleSpy).toHaveBeenCalledWith(
                'Log out error:',
                'Logout API error'
            )
        ); 
    });
});

describe('component renders elements', () => {
    it('renders Nav list if path name not "/" with links to the correct location', async () => {
        //action
        render( 
            <MemoryRouter initialEntries={['/register']}>
                <Nav />
            </MemoryRouter>
        );
        //assert
        const gameLink = screen.getByRole('link', { name: `Game` }); //replace with /Start a game/i once you remove the other links
        const registerLink = screen.getByRole('link', { name: `Register` });
        const loginLink = screen.getByRole('link', { name: `Login` });
        const scoresLink = screen.getByRole('link', { name: `Scores` });
        const profileLink = screen.getByRole('link', { name: `Profile` });
        expect(gameLink).toHaveAttribute('href', '/game');
        expect(registerLink).toHaveAttribute('href', '/register');
        expect(loginLink).toHaveAttribute('href', '/login');
        expect(scoresLink).toHaveAttribute('href', '/scores');
        expect(profileLink).toHaveAttribute('href', '/profile');

    });

    it('doesnt render Nav list or login reminder message if path name is "/"', async () => {
        //action
        render( 
            <MemoryRouter initialEntries={['/']}>
                <Nav />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(screen.queryByText('Game')).not.toBeInTheDocument();
            expect(screen.queryByText('Register')).not.toBeInTheDocument();
            expect(screen.queryByText('Login')).not.toBeInTheDocument();
            expect(screen.queryByText('Scores')).not.toBeInTheDocument();
            expect(screen.queryByText('Profile')).not.toBeInTheDocument();
            expect(screen.queryByText('Login now to save games and access all content.')).not.toBeInTheDocument();
        });
    });

    //already tested logout button showing if user logged in

    it('doesnt render logout button if user not logged in', async () => {
        //arrange
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ isLoggedIn: false }),
        });
        //action
        render(
            <MemoryRouter>
                <Nav />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
        })
    });

    it('renders the login reminder message when not logged in and on certain pages', async () => {
        //arrange
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ isLoggedIn: false }),
        });
        //action
        render(
            <MemoryRouter initialEntries={['/game']}>
                <Nav />
            </MemoryRouter>
        );
        //assert
        const loginReminder = await screen.findByText('Login now to save games and access all content.');
        expect(loginReminder).toBeInTheDocument();
    });
})