import { Outlet } from 'react-router-dom';
import Nav from '../components/Nav.js'
import '../styles/Header.css';

//import React, { useState, useEffect } from 'react';
//import { API_BASE_URL } from '../App.js';

export default function Header () {
    return (
        <>
            <h1>Welcome to Lottie's Minefield App</h1>
            <Nav />
            <Outlet />
        </>
    );
}