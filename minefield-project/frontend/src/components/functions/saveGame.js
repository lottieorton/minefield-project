import { API_BASE_URL } from '../../App.js';

export const saveGame = async (gameDifficulty, win) => { 
    const payload = {
        difficulty: gameDifficulty,
        win: win
    };

    try {
        const response = await fetch(`${API_BASE_URL}/scores/saveScore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        const data = await response.json();

        if(!response.ok) {
            //Default error message
            let errorMessage = 'Saving Game failed.';
            throw new Error(errorMessage);
        }
        console.log(`savedgame: ${JSON.stringify(data)}`);
        return data;
    } catch (error) {
        console.error('Save game error:', error.message);
    }
};