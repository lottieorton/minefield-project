import { saveGame } from "../components/functions/saveGame.js";
import '@testing-library/jest-dom';
import { waitFor, render, screen } from "@testing-library/react";

describe('saveGame', () => {    
    it('on successful game save navigates to /scores', async () => {
        //arrange
        const mockSaveGame = {
            "game_id": 1,
            "user_id": 10,
            "difficulty": "easy",
            "win": true
        }
        //mocking the API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 201,
            json: () => mockSaveGame
        });    
        //action
        const saveGameResponse = await saveGame('easy', true);
        //assert
        expect(saveGameResponse).toEqual(mockSaveGame);
    });

    it('handles error for !response.ok', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        //mocking the API call
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: () => { message: "Internal Server Error" }
        });    
        //action
        await saveGame('easy', true);
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Save game error:',
                'Saving Game failed.'
            );
        });
        //clean up
        consoleSpy.mockRestore();
    });

    it('handles error for network error', async () => {
        //arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        //mocking the API call
        global.fetch = jest.fn().mockRejectedValue(new Error('Save Score Issue Error'));
        //action
        await saveGame('easy', true);
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Save game error:',
                'Save Score Issue Error'
            );
        });
        //clean up
        consoleSpy.mockRestore();
    });
});