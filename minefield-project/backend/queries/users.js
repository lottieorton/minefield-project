//const express = require('express');
const { pool } = require('./queries');
const bcrypt = require('bcrypt');

async function createUser (user) {
    const {username, password, first_name, last_name} = user;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, hashedPassword, first_name, last_name]
        );
        const newUser = result.rows[0];
        return newUser;
    } catch (error) {
        if (error.code === '23505') {
            throw new Error(`Username already taken`);
        }
        console.error('Database INSERT error:', error);
        throw error;
    }
};

const registerUser = async (req, res) => {
    console.log('hitting register user');
    console.log('req.body: ' + JSON.stringify(req.body));
    const { username, password, first_name, last_name } = req.body;
    try {
        const newuser = await createUser({username, password, first_name, last_name});
        res.status(201).json({
            msg: 'New user created',
            newuser
        });
    } catch (error) {
        const status = error.message.includes('already taken') ? 409 : 500;
        res.status(status).json({
            msg: error.message || 'Unable to create user due to a server error'
        });
    }
};

const getUsers = (req, res) => {
    pool.query('SELECT username FROM users ORDER BY username ASC', (error, results) => {
        if(error) {
            return res.status(500).json({ msg: 'Unable to retrieve users'});
        }
        res.status(200).json(results.rows);
    })
};

module.exports = {
    createUser,
    registerUser,
    getUsers
};