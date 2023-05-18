import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import formatError from "../utils/formatError.js";
import validateSignUpRequest from "../middleware/validateSignUpRequest.js";
import validateSignInRequest from "../middleware/validateSignInRequest.js";
import signUpSchema from "../schema/signUpSchema.js";
import signInSchema from "../schema/signInSchema.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

dotenv.config();

const router = express.Router();

//sign up
router.post(
  "/signup",
  signUpSchema,
  validateSignUpRequest,
  async (req, res, next) => {
    try {
      const { name, username, password, email } = req.body;
      const hashedpassword = await bcrypt.hash(password, 8);

      const users = await prisma.users.findMany();

      let fieldsToValidate = {
        allUserNames: [],
        allEmails: [],
      };
      fieldsToValidate = users.reduce((accumulator, user) => {
        accumulator.allEmails.push(user.email);

        accumulator.allUserNames.push(user.username);

        return accumulator;
      }, fieldsToValidate);
      if (fieldsToValidate.allEmails.includes(email)) {
        next(formatError(422, "Email ID already exist"));
      } else if (fieldsToValidate.allUserNames.includes(username)) {
        next(formatError(422, "User name already exist"));
      } else {
        const usersAferInserted = await prisma.users.create({
          data: {
            name: name,
            username: username,
            password: hashedpassword,
            email: email,
            role_id: 2,
          },
        });

        console.log(usersAferInserted, "usersAfterInserted");
        res.json({
          Message: "Registered Successfully",
          userDetals: {
            id: usersAferInserted.id,
            name: usersAferInserted.name,
            username: usersAferInserted.username,
            email: usersAferInserted.email,
          },
        });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//sign in
router.post(
  "/signin",
  signInSchema,
  validateSignInRequest,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await prisma.users.findUnique({
        where: {
          username: username,
        },
      });
      console.log(user, "user");

      if (!user) {
        next(
          formatError(401, "User not registered, sign up here /api/auth/signup")
        );
      } else if (!(await bcrypt.compare(password, user.password))) {
        next(formatError(401, "Password not matched"));
      } else {
        let jwt_token = jwt.sign(
          { username: username },
          process.env.SECRET_KEY,
          {
            expiresIn: 86400,
          }
        );
        res.json({
          message: "Login successfull",
          details: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
          },
          jwt_token: jwt_token,
        });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;
