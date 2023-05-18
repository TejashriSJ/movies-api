import { body } from "express-validator";

const updateMovieSchema = [
  body("Title").optional().trim().exists({ checkFalsy: true }),
  body("Description").optional().trim().exists({ checkFalsy: true }),
  body("Runtime").optional().isInt({ min: 1 }),
  body("Genre").optional().isAlpha(),
  body("Rating").optional().isFloat({ min: 0.0, max: 10.0 }),
  body("Metascore").optional().isString(),
  body("Votes").optional().isInt({ min: -1 }),
  body("Gross_Earning_in_Mil").optional().isString(),
  body("Director").optional().isAlpha("en-IN", { ignore: " " }),
  body("Actor").optional().isAlpha("en-IN", { ignore: " " }),
  body("Year").optional().isInt({ min: 1000 }),

  body().custom((value, { req }) => {
    const bodyLength = Object.keys(req.body).length;
    const bodyFields = Object.keys(req.body);
    const requiredFields = [
      "Title",
      "Description",
      "Runtime",
      "Genre",
      "Rating",
      "Metascore",
      "Votes",
      "Gross_Earning_in_Mil",
      "Director",
      "Actor",
      "Year",
    ];

    if (bodyLength > 0 && bodyLength <= 11) {
      let invalidFields = bodyFields.filter((field) => {
        return requiredFields.includes(field);
      });

      if (invalidFields.length === bodyLength) {
        return true;
      } else {
        throw new Error("Invalid body");
      }
    } else {
      throw new Error("Invalid body ");
    }
  }),
];

export default updateMovieSchema;
