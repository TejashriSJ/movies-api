import { validationResult } from "express-validator";

import formatError from "../utils/formatError.js";

const validateUpdateMovieRequest = (req, res, next) => {
  if (validationResult(req).errors.length > 0) {
    let updateMovieError = formatError(400, "Invalid input fields");
    updateMovieError.messageObj.format = {
      Title: "a string of alphabets, may contain space inbetween",
      Description: " a string",
      Runtime: "a positive integer",
      Genre: "string of alphabets",
      Rating: "a float between 0.0 and 10.0 ",
      Metascore: "a string",
      Votes: "a positive integer",
      Gross_Earning_in_Mil: "a string",
      Director: "a string of alphabets, may contain space",
      Actor: "a string of alphabets, may contain space",
      Year: "an integer",
    };
    next(updateMovieError);
  } else {
    next();
  }
};

export default validateUpdateMovieRequest;
