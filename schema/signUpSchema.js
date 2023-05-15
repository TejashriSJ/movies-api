import { body } from "express-validator";

const signUpSchema = [
  body("name").isAlpha("en-IN", { ignore: " " }),
  body("username").exists({ checkFalsy: true }),
  body("password").isStrongPassword(),
  body("email").isEmail(),
];

export default signUpSchema;
