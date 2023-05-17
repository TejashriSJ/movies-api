import { body } from "express-validator";

const addMovieSchema = [
  body("Title").trim().exists({ checkFalsy: true }),
  body("Description").trim().exists({ checkFalsy: true }),
  body("Runtime").isInt({ min: 1 }),
  body("Genre").isAlpha(),
  body("Rating").isFloat({ min: 0.0, max: 10.0 }),
  body("Metascore").isString(),
  body("Votes").isInt({ min: -1 }),
  body("Gross_Earning_in_Mil").isString(),
  body("Director").isAlpha("en-IN", { ignore: " " }),
  body("Actor").isAlpha("en-IN", { ignore: " " }),
  body("Year").isInt({ min: 1000 }),
  body().custom((value, { req }) => {
    const bodyLength = Object.keys(req.body).length;
    if (bodyLength === 11) {
      return true;
    } else {
      throw new Error("Invalid body length");
    }
  }),
];

export default addMovieSchema;
