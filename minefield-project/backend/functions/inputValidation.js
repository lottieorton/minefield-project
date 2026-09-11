const { validationResult } = require("express-validator");

const inputValidation = (req, res, next) => {
  if (validationResult(req).errors.length > 0) {
    let errorMessage = "";
    validationResult(req).errors.forEach((message, index) => {
      if (!message.msg) return;
      if (index === 0) {
        errorMessage += message.msg;
      } else {
        errorMessage += " | " + message.msg;
      }
    });

    return res.status(500).json({
      msg: errorMessage
        ? errorMessage
        : "Unable to retrieve scores due to a server error",
    });
  }
  return next();
};

module.exports = {
  inputValidation,
};
