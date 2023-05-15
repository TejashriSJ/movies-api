import { validationResult } from "express-validator";

import formatError from "../utils/formatError.js";

const validateSignInRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.errors.length > 0) {
    let signInError = formatError(400, "Invalid input fields");
    signInError.messageObj.format = {
      username: "registered username",
      password: "registered password",
    };
    next(signInError);
  } else {
    next();
  }
};

export default validateSignInRequest;
