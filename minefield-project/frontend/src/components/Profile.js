import '../styles/Scores.css';
//import '../styles/Profile.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App.js';

export default function Profile () {
    const [ updatedInfo, setUpdatedInfo ] = useState({
        firstName: '',
        lastName: ''
    });
    const [user, setUser] = useState({username: '', first_name: '', last_name: ''});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect( () => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();
                console.log('data: ' + JSON.stringify(data));

                if(!response.ok) {
                    //Default error message
                    let errorMessage = 'Selecting user details failed. Please try again.';
                    throw new Error(errorMessage);
                }
                console.log(`data: ${data}`)
                setUser(data.user);
            } catch (error) {
                console.error('User selection error:', error.message);
            }
        };
        fetchUser();
    }, []);

    const handleChange = async (e) => {
        setUpdatedInfo({
            ...updatedInfo,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError(null);
        setSuccess(null);

        const payload = {
            first_name: updatedInfo.firstName,
            last_name: updatedInfo.lastName
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/updateUser`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('data: ' + JSON.stringify(data));

            if(!response.ok) {
                //Default error message
                let errorMessage = 'Updating user details failed. Please try again.';
                throw new Error(errorMessage);
            }

            //Set success message and clear form
            setSuccess(`Success! User details updated for ${user.username}.`);
            setUpdatedInfo({firstName: '', lastName: ''});
        } catch (error) {
            console.error('Update error:', error.message);
            setError(error.message);
        }
    }
    
    return (
        <div className='profile'>
            <h1 className="main-header">Profile</h1>
            <div className='user-block'>
                <div className="user-details">
                    <h2 className='user-info-header'>Your info:</h2>
                    <h4>Username: {user.username}</h4>
                    <h4>First Name: {user.first_name}</h4>
                    <h4>Last Name: {user.last_name}</h4>
                </div>
            </div>
            <form className='user-form-component' onSubmit={handleSubmit}>
                <div className="form">
                    <div className='user-form-fields'>
                        <h2 className="main-header">Want to update your details:</h2>
                        <label for="first-name">First Name: </label>
                        <input id="first-name" name="firstName" type="text" onChange={handleChange} value={updatedInfo.firstName} required />
                        <label for="last-name">Last Name: </label>
                        <input id="last-name" name="lastName" type="text" onChange={handleChange} value={updatedInfo.lastName} required />
                    </div>
                </div>
                <div className="user-form-button">
                    <button type="submit">Update Details</button>
                </div>
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