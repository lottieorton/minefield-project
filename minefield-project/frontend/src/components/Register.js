import '../styles/UserForms.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App.js';

export default function Register () {
    const navigate = useNavigate();
    const [ registerInfo, setRegisterInfo ] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = async (e) => {
        setRegisterInfo({
            ...registerInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages and set loading state
        setError(null);
        setSuccess(null);

        const payload = {
            username: registerInfo.username,
            password: registerInfo.password,
            first_name: registerInfo.firstName,
            last_name: registerInfo.lastName
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            console.log('Not treated as throwing an error at this point');
            const data = await response.json();

            if(!response.ok) {
                //Default error message
                let errorMessage = 'Registration failed. Please try again.';
                // Customize this condition to check for a "username exists" error
                if (response.status === 409) {
                    errorMessage = `The username "${registerInfo.username}" is already taken. Please choose another one.`;
                } else if (response.status === 500 && data.msg) {
                    errorMessage = data.msg;
                }
                throw new Error(errorMessage);
            }

            //Set success message and clear form
            setSuccess(`Success! Account created for ${registerInfo.username}. Redirecting to login...`);
            setRegisterInfo({username: '', password: '', firstName: '', lastName: ''});

            //2s delay before redirecting
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error.message);
            setError(error.message);
        }
    }
    
    return (
        <div className='user-form-component'>
            <h2 className="main-header">Let's Get You Signed Up!</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="user-form">
                    <div className='user-form-fields'>
                        <label for="username">Username: </label>
                        <input id="username" name="username" type="text" onChange={handleChange} value={registerInfo.username} required />
                        <label for="password">Password: </label>
                        <input id="password" name="password" type="password" onChange={handleChange} value={registerInfo.password} required />
                        <label for="first-name">First Name: </label>
                        <input id="first-name" name="firstName" type="text" onChange={handleChange} value={registerInfo.firstName} required />
                        <label for="last-name">Last Name: </label>
                        <input id="last-name" name="lastName" type="text" onChange={handleChange} value={registerInfo.lastName} required />
                    </div>
                </div>
                <div className="user-form-button">
                    <button type="submit">Sign Me Up!</button>
                </div>
                <Link className='redirect-user-entry' to="/login">
                    Already registered or want to Login with Google? Login here.
                </Link>
            </form>


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