import Profile from '../components/Profile.js';
import { findByRole, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { test } from 'mocha';

describe('fetches user info', () => {
    const testUser = {
        user: {username: "testUser", first_name: 'Lotts', last_name: 'Here'},
    };

    it('passes updated user info to component to render', async () => {
        //arrange
        //mocking the API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => testUser,
        });
        
        //action
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        //screen.debug();
        //assert
        const username = await screen.findByText(`Username: ${testUser.user.username}`);
        const firstName = await screen.findByText(`First Name: ${testUser.user.first_name}`);
        const lastName = await screen.findByText(`Last Name: ${testUser.user.last_name}`);
        expect(username).toBeInTheDocument(); 
        expect(firstName).toBeInTheDocument(); 
        expect(lastName).toBeInTheDocument(); 
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
                <Profile />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'User selection error:',
                'Selecting user details failed. Please try again.'
            );
        });
        //clean up
        consoleSpy.mockRestore();
    });

    it('handles database error', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const errorMessage = 'Get User Issue Error';
        //mocking the API call
        global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));
        
        //action
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        //assert
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'User selection error:',
                errorMessage
            );
        });
        //clean up
        consoleSpy.mockRestore();
    });
});

describe('handleChange', () => {
    const user = userEvent.setup();
    it.each([
        {formField: /first name/i, input: 'test first name', expected: 'test first name'},
        {formField: /last name/i, input: 'test last name', expected: 'test last name'},
    ])('updates the values shown on screen when form fields are updated, via the state', async ({formField, input, expected}) => {
        //arrange
        render(
            <MemoryRouter>
                <Profile />
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
        //mocking the page load API call
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({user: {username: "testUser", first_name: 'Lotts', last_name: 'Here'}}),
        })
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                msg: 'User updated',
                user: {
                    "username": "testUser",
                    "first_name": "Test",
                    "last_name": "Name"
                }
            })
        });
        
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        
        //action
        await screen.findByText(/lotts/i);
        await user.type(screen.getByLabelText(/first name/i), 'Test');
        await user.type(screen.getByLabelText(/last name/i), 'Name');
        await user.click(screen.getByRole('button', {name: /update details/i}));
        
        //assert
        await waitFor (() => {
            expect(global.fetch).toHaveBeenNthCalledWith(2,
                expect.stringContaining('user/updateUser'),
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({ first_name: 'Test', last_name: 'Name'})
                })
            );
        })
        global.fetch.mockClear();
    });

    it('renders success message if response.ok and form fields back to blank', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the page load API call
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({user: {username: "testUser", first_name: 'Lotts', last_name: 'Here'}}),
        })
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                msg: 'User updated',
                user: {
                    "username": "testUser",
                    "first_name": "Test",
                    "last_name": "Name"
                }
            })
        });
        
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        
        //action
        await screen.findByText(/lotts/i);
        await user.type(screen.getByLabelText(/first name/i), 'Test');
        await user.type(screen.getByLabelText(/last name/i), 'Name');
        await user.click(screen.getByRole('button', {name: /update details/i}));
        const firstNameInput = screen.getByLabelText(/first name/i);
        const lastNameInput = screen.getByLabelText(/last name/i);
        
        //assert
        await waitFor (() => {
            expect(screen.getByText(/success! User details updated for testUser./i)).toBeInTheDocument();
            expect(firstNameInput).toHaveValue('');
            expect(lastNameInput).toHaveValue(''); 
        })
        global.fetch.mockClear();
    });

    it('for!response.ok renders error message', async () => {
        //arrange
        const user = userEvent.setup();
        //mocking the API call
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({user: {username: "testUser", first_name: 'Lotts', last_name: 'Here'}}),
        })
        .mockResolvedValueOnce({
            ok: false,
            status: 200,
            json: async () => ({"msg":"error with response object"}),
        })

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        //action
        await screen.findByText(/lotts/i);
        await user.type(screen.getByLabelText(/first name/i), 'Testing');
        await user.type(screen.getByLabelText(/last name/i), 'Name');
        await user.click(screen.getByRole('button', {name: /update details/i}));
        //assert
        const errorMessage = screen.getByText('Updating user details failed. Please try again.')
        expect(errorMessage).toBeInTheDocument();
        global.fetch.mockClear();
    });

    it('API error causes error message to render', async () => {
        //arrange
        const user = userEvent.setup();
        const errorMessage = 'Error updating users name';
        //mocking the API call
        global.fetch = jest.fn()
        .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({user: {username: "testUser", first_name: 'Lotts', last_name: 'Here'}}),
        })
        .mockRejectedValue(new Error(errorMessage))
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        //action
        await screen.findByText(/lotts/i);
        await user.type(screen.getByLabelText(/first name/i), 'Testing');
        await user.type(screen.getByLabelText(/last name/i), 'Name');
        await user.click(screen.getByRole('button', {name: /update details/i}));
        //assert
        const errorNote = screen.getByText(errorMessage)
        expect(errorNote).toBeInTheDocument();
        global.fetch.mockClear();
    });
});

describe('Profile component', () => {    
    it('Renders the default Profile form', () => {
        //action
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
        //assert
        //screen.debug;
        const header = screen.getByText(/Profile/i);
        const infoHeader = screen.getByText(/your info:/i);
        const usernameInfo = screen.getByText(/username:/i);
        const firstNameInfo = screen.getAllByText(/first name:/i);
        const lastNameInfo = screen.getAllByText(/last name:/i);
        const updateButton = screen.getByRole('button', {name: /update details/i});
        expect(header).toBeInTheDocument();
        expect(infoHeader).toBeInTheDocument();
        expect(usernameInfo).toBeInTheDocument();
        expect(firstNameInfo.length).toBe(2);
        expect(lastNameInfo.length).toBe(2);
        expect(updateButton).toBeInTheDocument();
    });
});