import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../App.js';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import MinesweeperIcon from '../imgs/MinesweeperIcon.png';
import '../styles/Nav.css';

export default function Nav () {
    const location = useLocation();
    const navigate = useNavigate();
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);

    useEffect(() => {
        const loggedInStatus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/loggedInStatus`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if(!response.ok) {
                    let errorMessage = 'Logged in status request failed.';
                    throw new Error(errorMessage);
                }
                const loggedIn = data.isLoggedIn;
                console.log(`Logged in data: ${loggedIn}`);
                
                setIsLoggedIn(loggedIn);

            } catch (error) {
                console.error('Login status fetching error:', error.message);
            }
        };
        loggedInStatus();
    }, [])

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if(!response.ok) {
                let errorMessage = 'Logged out request failed.';
                throw new Error(errorMessage);
            }
            console.log(`Log out data: ${JSON.stringify(data)}`);
            window.location.href = '/';
            //navigate('/');
        } catch (error) {
            console.error('Log out error:', error.message);
        }
    }

    return (
        <div>
            <nav className='nav-bar'>
                {location.pathname !== '/' && (
                    <section className='nav-links'>
                        <Link className='navLink' to="/">
                            <img src={MinesweeperIcon} alt='Minesweeper image' className='nav-icon' />
                        </Link>
                        <Link className='navLink' to="/game">Game</Link>
                        <Link className='navLink' to="/register">Register</Link>
                        <Link className='navLink' to="/login">Login</Link>
                        <Link className='navLink' to="/scores">Scores</Link>
                        <Link className='navLink' to="/profile">Profile</Link>
                    </section>
                )}
                {isLoggedIn && (
                    <div className='logout-button-container'>
                        <button className='logout-button' onClick={handleClick}>Logout</button>
                    </div>
                )}
            </nav>

            {!isLoggedIn && location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/login' && (
                <div className="login-message">
                    <h2>Login now to save games and access all content.</h2>
                </div>
            )}
        </div>
    );
}