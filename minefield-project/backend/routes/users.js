const express = require('express');
const usersRouter = express.Router();
const { registerUser, getUsers } = require('../queries/users.js');

usersRouter.post('/register', registerUser);
usersRouter.get('/', getUsers);
//UPDATE USER

module.exports = usersRouter;