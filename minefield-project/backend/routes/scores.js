const express = require('express');
const scoreRouter = express.Router();
const { getScores, saveScore } = require('../queries/scores.js');
const { ensureAuthenticated } = require('../functions/ensureAuthenticated.js');

scoreRouter.post('/saveScore', ensureAuthenticated, saveScore);
scoreRouter.get('/', ensureAuthenticated, getScores);

module.exports = scoreRouter;