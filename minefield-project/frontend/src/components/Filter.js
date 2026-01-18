import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';

export default function Filter({ onValueChange }) {
    const handleChange = (e) => {
        onValueChange(e.target.value);
    }

    return (
        <>            
            <form>
                <label for= "gameChoices">Choose your difficulty: </label>
                <select id="gameChoices" name="gameChoices" onChange={handleChange}>
                    <option value="easy" >Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </form>
        </>
    )
}
