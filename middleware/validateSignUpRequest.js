import { validationResult } from "express-validator";
import formatError from "../utils/formatError.js";

const validateSignUpRequest = (req, res, next) => {
  const result = validationResult(req);
  console.log(result);
  if (result.errors.length > 0) {
    let signUpError = formatError(400, "Input fields are not valid");
    signUpError.messageObj.format = {
      name: "Must contain only alphabets",
      username: "Must be string of length >5",
      password:
        "Must contain one capital, one special charecter, one number and length >8",
      email: "example@domain.com",
    };
    next(signUpError);
  } else {
    next();
  }
};

export default validateSignUpRequest;
