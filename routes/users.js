import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import formatError from "../utils/formatError.js";
import validateSignUpRequest from "../middleware/validateSignUpRequest.js";
import validateSignInRequest from "../middleware/validateSignInRequest.js";
import signUpSchema from "../schema/signUpSchema.js";
import signInSchema from "../schema/signInSchema.js";
import sqlQuery from "../utils/sqlQuery.js";

dotenv.config();

const router = express.Router();

//sign up
router.post(
  "/signup",
  signUpSchema,
  validateSignUpRequest,
  (req, res, next) => {
    const { name, username, password, email } = req.body;
    const hashedpassword = bcrypt.hashSync(password, 8);

    let sql = `SELECT username,password,email from users`;

    sqlQuery(sql)
      .then((results) => {
        let fieldsToValidate = {
          allUserNames: [],
          allEmails: [],
        };
        fieldsToValidate = results.reduce((accumulator, result) => {
          accumulator.allEmails.push(result.email);

          accumulator.allUserNames.push(result.username);

          return accumulator;
        }, fieldsToValidate);

        if (fieldsToValidate.allEmails.includes(email)) {
          next(formatError(422, "Email ID already exist"));
        } else if (fieldsToValidate.allUserNames.includes(username)) {
          next(formatError(422, "User name already exist"));
        } else {
          let sql = `INSERT into users (name,username,password,email,role_id) values (?,?,?,?,?)`;
          let parameters = [name, username, hashedpassword, email, 1];

          sqlQuery(sql, parameters)
            .then((result) => {
              let sql = `SELECT id,name,username,email from users where id = ?`;

              return sqlQuery(sql, result.insertId);
            })
            .then((result) => {
              res.json({
                Message: "Registered Successfully",
                userDetals: result,
              });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        console.error(err, "Error in adding user data");
        next(err);
      });
  }
);

//sign in
router.post(
  "/signin",
  signInSchema,
  validateSignInRequest,
  (req, res, next) => {
    const { username, password } = req.body;

    let sql = `SELECT username , password ,id,name,email from users where BINARY username  = ?`;

    sqlQuery(sql, username)
      .then((result) => {
        if (result.length === 0) {
          next(
            formatError(
              401,
              "User not registered, sign up here /api/auth/signup"
            )
          );
        } else if (!bcrypt.compareSync(password, result[0].password)) {
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
              id: result[0].id,
              name: result[0].name,
              username: result[0].username,
              email: result[0].email,
            },
            jwt_token: jwt_token,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  }
);

export default router;
