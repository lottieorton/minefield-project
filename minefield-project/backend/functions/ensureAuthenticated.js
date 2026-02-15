const ensureAuthenticated = (req, res, next) => {
    console.log('ensureAuthenticated called');
    if(req.isAuthenticated()) {// checks if Passport has authenticated the user
        return next();
    }
    res.status(400).json({isLoggedIn: false});
};

module.exports = {
    ensureAuthenticated
}