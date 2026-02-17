import '../styles/Scores.css';
import ScoreCard from './presentational/ScoreCard.js';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';

export default function ScorePage () {
    const [scores, setScores] = useState([
        {difficulty: "Easy", games: 0, wins: 0, losses: 0, 'wlratio': 0},
        {difficulty: "Medium", games: 0, wins: 0, losses: 0, 'wlratio': 0},
        {difficulty: "Hard", games: 0, wins: 0, losses: 0, 'wlratio': 0}
    ]);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/scores/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if(!response.ok) {
                    let errorMessage = 'Scores request failed. Please try refreshing the page.';
                    throw new Error(errorMessage);
                }
                // console.log(`Scores data: ${JSON.stringify(data)}`);
                const updatedScore = scores.map(score => {
                    const dbScores = data.find(dbScore => score.difficulty.toLowerCase() == dbScore.difficulty);
                    return {
                        ...score,
                        ...dbScores,
                        difficulty: score.difficulty
                    };
                });
                // console.log(`updatedScore: ` + JSON.stringify(updatedScore));
                setScores(updatedScore);
            } catch (error) {
                console.error('Score fetching error:', error.message);
            }
        };
        fetchScores();
    }, []
    );
    
    return (
        <div className='scores-page'>
            <div className='score-block'>
                {scores.map(game => {
                    return <ScoreCard game={game} />
                })}
            </div>
        </div>
    );
}