import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';
import { Link } from 'react-router-dom';
import MinesweeperIcon from '../imgs/MinesweeperIcon.png';

export default function Nav () {

    return (
        <section className='navSection'>
            <section className='links'>
                <Link className='navLink' to="/game">Start a game</Link>
                <Link className='navLink' to="/game">Start a game 2</Link>
                <Link className='navLink' to="/game">Start a game 3</Link>
                <Link className='navLink' to="/game">Start a game 4</Link>
            </section>
            <img src={MinesweeperIcon} alt="Lottie's MineSweeper Icon" className='icon' />
        </section>
    );
}