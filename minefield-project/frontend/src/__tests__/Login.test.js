import Login from '../components/Login.js';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const mockNavigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigateFunction
}));

describe('handleChange', () => {
    const user = userEvent.setup();
    it.each([
        {formField: /username/i, input: 'test username', expected: 'test username'},
        {formField: /password/i, input: 'test password', expected: 'test password'}
     ])('updates the values shown on screen when form fields are updated, via the state', async ({formField, input, expected}) => {
        //arrange
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //action
        const inputElement = screen.getByLabelText(formField);
        await user.type(inputElement, input);
        //assert
        expect(inputElement.value).toBe(expected);
    });
});

describe('handleSubmit', () => {
    it('handleSubmit makes correct API call with payload values', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({
                    message: 'Login Successful',
                    user: {
                        "id": 1,
                        "username": "usernameMe",
                        "firstName": "Test Name"
                    }
                })
            })
        );
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByRole('button', {name: /log me in!/i}));
        //assert
        await waitFor (() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: 'usernameMe', password: 'Password123!'})
                })
            )
        })
        global.fetch.mockClear();
    });

    it('renders success message if response.ok and form fields back to blank', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({
                    message: 'Login Successful',
                    user: {
                        "id": 1,
                        "username": "usernameMe",
                        "firstName": "TestName"
                    }
                })
            })
        );
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByRole('button', {name: /log me in!/i}));
        //assert
        const successMessage = screen.getByText(`Success! TestName logged in.`);
        expect(successMessage).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        global.fetch.mockClear();
    });

    it('navigates to homepage if response.ok', async () => {
        //arrange
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({
                    msg: "Login Successful",
                    user: {
                        "id": 10,
                        "username": "usernameMe",
                        "firstName": "TestName",
                    }
                })
            })
        );
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //action
        jest.useFakeTimers();
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');

        await user.click(screen.getByRole('button', {name: /log me in!/i}));
        //assert
        const successMessage = await screen.findByText(`Success! TestName logged in.`);
        expect(successMessage).toBeInTheDocument();
        jest.runAllTimers();
        expect(mockNavigateFunction).toHaveBeenCalledWith('/');
        jest.useRealTimers();
    });

    it('!response.ok renders error message', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({})
            })
        );
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByRole('button', {name: /log me in!/i}));
        //assert
        const errorMessage = screen.getByText('Login failed. Please try again.')
        expect(errorMessage).toBeInTheDocument();
        global.fetch.mockClear();
    });

    it('API error causes error message to render', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockRejectedValue(new Error('Login Issue Error'));
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByRole('button', {name: /log me in!/i}));
        //assert
        const errorMessage = screen.getByText(`Login Issue Error`)
        expect(errorMessage).toBeInTheDocument();
        global.fetch.mockClear();
    });
});

describe('Login component', () => {    
    it('Renders the default Login form', () => {
        //action
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //assert
        //screen.debug;
        const header = screen.getByText(/Login!/i);
        const usernameLabel = screen.getByLabelText(/username/i);
        const passwordLabel = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', {name: /log me in!/i});
        expect(header).toBeInTheDocument();
        expect(usernameLabel).toBeInTheDocument();
        expect(passwordLabel).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
    });

    it('Renders the Google Login link going to correct URL', () => {
        //arrange
        const googleLink = 'http://localhost:4001/login/google';
        //action
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        //assert
        //screen.debug;
        const googleButton = screen.getByRole('link', {name: /sign in with google/i});
        expect(googleButton).toBeInTheDocument();
        expect(googleButton).toHaveAttribute('href', googleLink);
    });
});