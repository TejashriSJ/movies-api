import { body } from "express-validator";

const signInSchema = [
  body("username").exists({ checkFalsy: true }),
  body("password").exists({ checkFalsy: true }),
  body().custom((value, { req }) => {
    const bodyLength = Object.keys(req.body).length;
    if (bodyLength === 2) {
      return true;
    } else {
      throw new Error("Invalid body length");
    }
  }),
];

export default signInSchema;
