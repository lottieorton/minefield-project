const express = require('express');
const usersRouter = express.Router();
const { registerUser, getUsers, updateUser, getUser } = require('../queries/users.js');
const { ensureAuthenticated, checkLoggedIn } = require('../functions/ensureAuthenticated.js');
const { check } = require('express-validator');
const { inputValidation } = require('../functions/inputValidation.js');

usersRouter.post('/register', [
    check('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
], inputValidation, registerUser);
usersRouter.get('/', ensureAuthenticated, getUser);
//usersRouter.get('/all', getUsers);
usersRouter.patch('/updateUser', ensureAuthenticated, updateUser);
usersRouter.get('/loggedInStatus', checkLoggedIn);

module.exports = usersRouter;