import { body } from "express-validator";

const signUpSchema = [
  body("name").isAlpha("en-IN", { ignore: " " }),
  body("username").trim().exists({ checkFalsy: true }).isLength({ min: 5 }),
  body("password").isStrongPassword(),
  body("email").isEmail(),
  body().custom((value, { req }) => {
    const bodyLength = Object.keys(req.body).length;
    if (bodyLength === 4) {
      return true;
    } else {
      throw new Error("Invalid body length");
    }
  }),
];

export default signUpSchema;
