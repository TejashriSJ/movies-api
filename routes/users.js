import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import connection from "../config/connection.js";
import formatError from "../utils/formatError.js";
import validateSignUpRequest from "../middleware/validateSignUpRequest.js";
import validateSignInRequest from "../middleware/validateSignInRequest.js";
import signUpSchema from "../schema/signUpSchema.js";
import signInSchema from "../schema/signInSchema.js";

dotenv.config();

const router = express.Router();

//sign up
router.post(
  "/signup",
  signUpSchema,
  validateSignUpRequest,
  (req, res, next) => {
    const { name, username, password, email, role } = req.body;
    const hashedpassword = bcrypt.hashSync(password, 8);

    let fieldsToValidate = {
      allRoles: [],
      allUserNames: [],
      allEmails: [],
    };

    let sql = `SELECT username,password,email,role from users
   INNER JOIN
  roles on users.role_id = roles.id`;
    connection.query(sql, (err, results) => {
      if (err) {
        console.error(err, "Error in getting all roles");
        next(err);
      } else {
        fieldsToValidate = results.reduce((accumilator, result) => {
          accumilator.allEmails.push(result.email);
          accumilator.allRoles.push(result.role);
          accumilator.allUserNames.push(result.username);
          return accumilator;
        }, fieldsToValidate);

        if (!fieldsToValidate.allRoles.includes(role)) {
          next(
            formatError(
              422,
              "Role does not exist,available roles are user and admin"
            )
          );
        } else if (fieldsToValidate.allEmails.includes(email)) {
          next(formatError(422, "Email ID already exist"));
        } else if (fieldsToValidate.allUserNames.includes(username)) {
          next(formatError(422, "User name already exist"));
        } else {
          console.log("all correct");
          let sql = `INSERT into users (name,username,password,email,role_id) values ("${name}","${username}","${hashedpassword}","${email}",${
            fieldsToValidate.allRoles.indexOf(role) + 1
          })`;
          connection.query(sql, (err, result) => {
            if (err) {
              console.error(err, "Error in inserting users data");
              next(err);
            } else {
              res.json({
                Message: "Registered Successfully",
              });
            }
          });
        }
      }
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

    let sql = `SELECT username , password from users where BINARY username  = "${username}"`;
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(err, "Error in getting user details");
        next(err);
      } else {
        console.log(result);
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
            jwt_token: jwt_token,
          });
        }
      }
    });
  }
);

export default router;
