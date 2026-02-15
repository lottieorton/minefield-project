const express = require('express');
const usersRouter = express.Router();
const { registerUser, getUsers, updateUser, getUser } = require('../queries/users.js');
const { ensureAuthenticated } = require('../functions/ensureAuthenticated.js');

usersRouter.post('/register', registerUser);
usersRouter.get('/', ensureAuthenticated, getUser);
usersRouter.get('/all', getUsers);
usersRouter.patch('/updateUser', ensureAuthenticated, updateUser);

module.exports = usersRouter;