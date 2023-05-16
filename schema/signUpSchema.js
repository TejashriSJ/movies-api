import { body } from "express-validator";

const signUpSchema = [
  body("name").isAlpha("en-IN", { ignore: " " }),
  body("username").trim().exists({ checkFalsy: true }).isLength({ min: 5 }),
  body("password").isStrongPassword(),
  body("email").isEmail(),
];

export default signUpSchema;
