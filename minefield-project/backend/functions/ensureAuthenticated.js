const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // checks if Passport has authenticated the user
    return next();
  }
  res.status(400).json({ isLoggedIn: false });
};

const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // checks if Passport has authenticated the user
    return res.status(200).json({ isLoggedIn: true });
  }
  res.status(400).json({ isLoggedIn: false });
};

module.exports = {
  ensureAuthenticated,
  checkLoggedIn,
};
