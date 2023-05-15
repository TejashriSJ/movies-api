import { validationResult } from "express-validator";
import formatError from "../utils/formatError.js";

const validateMovieId = (req, res, next) => {
  if (validationResult(req).errors.length > 0) {
    next(formatError(400, `Id should be a number and greated than 0`));
  } else {
    next();
  }
};

export default validateMovieId;
