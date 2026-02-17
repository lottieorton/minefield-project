import Register from '../components/Register.js';
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
        {formField: /password/i, input: 'test password', expected: 'test password'},
        {formField: /first name/i, input: 'test first name', expected: 'test first name'},
        {formField: /last name/i, input: 'test last name', expected: 'test last name'},
    ])('updates the values shown on screen when form fields are updated, via the state', async ({formField, input, expected}) => {
        //arrange
        render(
            <MemoryRouter>
                <Register />
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
                status: 201,
                json: () => Promise.resolve({
                    msg: "New user created",
                    newuser: {
                        "id": 10,
                        "username": "usernameMe",
                        "password": "Password123",
                        "first_name": "Lottie",
                        "last_name": "Orton"
                    }
                })
            })
        );
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.type(screen.getByLabelText(/first name/i), 'Lottie');
        await user.type(screen.getByLabelText(/last name/i), 'Orton');
        await user.click(screen.getByRole('button', {name: /sign me up!/i}));
        //assert
        await waitFor (() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('user/register'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: 'usernameMe', password: 'Password123!', first_name: 'Lottie', last_name: 'Orton'})
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
                status: 201,
                json: () => Promise.resolve({
                    msg: "New user created",
                    newuser: {
                        "id": 10,
                        "username": "usernameMe",
                        "password": "Password123",
                        "first_name": "Lottie",
                        "last_name": "Orton"
                    }
                })
            })
        );
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.type(screen.getByLabelText(/first name/i), 'Lottie');
        await user.type(screen.getByLabelText(/last name/i), 'Orton');
        expect(screen.getByLabelText(/username/i)).toHaveValue('usernameMe');
        await user.click(screen.getByRole('button', {name: /sign me up!/i}));
        //assert
        const successMessage = screen.getByText(`Success! Account created for usernameMe. Redirecting to login...`);
        expect(successMessage).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/first name/i)).toHaveValue('');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('');
        global.fetch.mockClear();
    });

    it('navigates to login page if response.ok', async () => {
        //arrange
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                status: 201,
                json: () => Promise.resolve({
                    msg: "New user created",
                    newuser: {
                        "id": 10,
                        "username": "usernameMe",
                        "password": "Password123",
                        "first_name": "Lottie",
                        "last_name": "Orton"
                    }
                })
            })
        );
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //action
        jest.useFakeTimers();
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.type(screen.getByLabelText(/first name/i), 'Lottie');
        await user.type(screen.getByLabelText(/last name/i), 'Orton');

        await user.click(screen.getByRole('button', {name: /sign me up!/i}));
        //assert
        const successMessage = await screen.findByText(`Success! Account created for usernameMe. Redirecting to login...`);
        expect(successMessage).toBeInTheDocument();
        jest.runAllTimers();
        expect(mockNavigateFunction).toHaveBeenCalledWith('/login');
        jest.useRealTimers();
    });

    it('for username taken renders specific error message', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 409,
                json: () => Promise.resolve({"msg": "Username already taken"})
            })
        );
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.type(screen.getByLabelText(/first name/i), 'Lottie');
        await user.type(screen.getByLabelText(/last name/i), 'Orton');
        await user.click(screen.getByRole('button', {name: /sign me up!/i}));
        //assert
        const errorMessage = screen.getByText(`The username "usernameMe" is already taken. Please choose another one.`)
        expect(errorMessage).toBeInTheDocument();
        global.fetch.mockClear();
    });

    it('for other API call !response.ok renders generic error message', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({"msg":"value too long for type character varying(50)"})
            })
        );
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.type(screen.getByLabelText(/first name/i), 'Lottie');
        await user.type(screen.getByLabelText(/last name/i), 'Orton');
        await user.click(screen.getByRole('button', {name: /sign me up!/i}));
        //assert
        const errorMessage = screen.getByText('Registration failed. Please try again.')
        expect(errorMessage).toBeInTheDocument();
        global.fetch.mockClear();
    });

    it('API error causes error message to render', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //action
        await user.type(screen.getByLabelText(/username/i), 'usernameMe');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.type(screen.getByLabelText(/first name/i), 'Lottie');
        await user.type(screen.getByLabelText(/last name/i), 'Orton');
        await user.click(screen.getByRole('button', {name: /sign me up!/i}));
        //assert
        const errorMessage = screen.getByText(`Network Error`)
        expect(errorMessage).toBeInTheDocument();
        global.fetch.mockClear();
    });
});

describe('Register component', () => {    
    it('Renders the default Registration form', () => {
        //action
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        //assert
        //screen.debug;
        const header = screen.getByText(/Let's Get You Signed Up!/i);
        const usernameLabel = screen.getByLabelText(/username/i);
        const passwordLabel = screen.getByLabelText(/password/i);
        const firstNameLabel = screen.getByLabelText(/first name/i);
        const lastNameLabel = screen.getByLabelText(/last name/i);
        const loginLink = screen.getByRole('link', {name: /already registered or want to Login with Google\? Login here./i });
        expect(header).toBeInTheDocument();
        expect(usernameLabel).toBeInTheDocument();
        expect(passwordLabel).toBeInTheDocument();
        expect(firstNameLabel).toBeInTheDocument();
        expect(lastNameLabel).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });
});