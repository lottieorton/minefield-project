import '../styles/UserForms.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../App.js';

export default function Login () {
    const navigate = useNavigate();
    const [ loginInfo, setLoginInfo ] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = async (e) => {
        setLoginInfo({
            ...loginInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages and set loading state
        setError(null);
        setSuccess(null);

        const payload = {
            username: loginInfo.username,
            password: loginInfo.password
        };

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if(!response.ok) {
                //Default error message
                let errorMessage = 'Login failed. Please try again.';
                throw new Error(errorMessage);
            }

            //Set success message and clear form
            setSuccess(`Success! ${data.user.firstName} logged in.`);
            setLoginInfo({username: '', password: ''});

            //2s delay before redirecting
            setTimeout(() => {
                //navigate('/');
                window.location.href = '/';
            }, 2000);

        } catch (error) {
            console.error('Login error:', error.message);
            setError(error.message);
        }
    }
    
    return (
        <div className='user-form-component'>
            <h2 className="main-header">Login!</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="user-form">
                    <div className='user-form-fields'>
                        <label for="username">Username: </label>
                        <input id="username" name="username" type="text" onChange={handleChange} value={loginInfo.username} required />
                        <label for="password">Password: </label>
                        <input id="password" name="password" type="password" onChange={handleChange} value={loginInfo.password} required />
                    </div>
                </div>
                <div className="user-form-button">
                    <button type="submit">Log me in!</button>
                </div>
            </form>
            <a href={`${API_BASE_URL}/login/google`} className="google-button">Sign in with Google</a>
            <Link className='redirect-user-entry' to="/register">
                Not yet signed up? Register here.
            </Link>

            {/*Display error message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/*Display success message */}
            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}
        </div>
    );
}