import { body } from "express-validator";

const signInSchema = [
  body("username").exists({ checkFalsy: true }),
  body("password").exists({ checkFalsy: true }),
];

export default signInSchema;
