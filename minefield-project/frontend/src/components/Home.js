import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';
import { Link } from 'react-router-dom';
import MinesweeperIcon from '../imgs/MinesweeperIcon.png';

export default function Home () {
    return (
        <section className='homepageSection'>
            <section className='links'>
                <Link className='homepageLink' to="/game">Start a game</Link>
                <Link className='homepageLink' to="/register">Register</Link>
                <Link className='homepageLink' to="/login">Login</Link>
                <Link className='homepageLink' to="/scores">Scores</Link>
                <Link className='homepageLink' to="/profile">Profile</Link>
            </section>
            <img src={MinesweeperIcon} alt="Lottie's MineSweeper Icon" className='icon' />
        </section>
    );
}