import express from "express";
import connection from "../config/connection.js";
import validator from "validator";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const formatError = (statusCode, messageForClient) => {
  let error = {
    status: statusCode,
    messageObj: { status: "Error", Message: messageForClient },
  };
  return error;
};

//sign up
router.post("/signup", (req, res, next) => {
  const { name, username, password, email, role } = req.body;

  let fieldsToValidate = {
    allRoles: [],
    allUserNames: [],
    allEmails: [],
  };

  if (
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    let errObj = formatError(
      400,
      "Body should be object and it should not be empty"
    );
    errObj.messageObj.format = {
      name: "",
      username: "",
      password: "",
      email: "",
      role: "",
    };
    next(errObj);
  } else if (
    Object.values(req.body).filter((value) => {
      return value === "" || value === " ";
    }).length > 0
  ) {
    next(
      formatError(422, "Check the values Provided values should not be empty")
    );
  } else if (!validator.isAlpha(name, "en-IN", { ignore: " " })) {
    next(formatError(422, "Name should contain only alphabets"));
  } else if (!validator.isEmail(email)) {
    next(formatError(422, "Not a valid email ID"));
  } else if (validator.isEmpty(username, { ignore_whitespace: true })) {
    next(formatError(422, "User name should not be empty"));
  } else if (!validator.isStrongPassword(password)) {
    next(formatError(422, "Password must be strong"));
  } else {
    connection.query(
      `SELECT
     username,password,email,role from users
      INNER JOIN
       roles on users.role_id = roles.id
       `,
      (err, results) => {
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
            let sql = `INSERT into users (name,username,password,email,role_id) values ("${name}","${username}","${password}","${email}",${
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
      }
    );
  }
});

//sign in
router.post("/signin", (req, res, next) => {
  const { username, password } = req.body;

  if (
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    next(formatError(400, "Body should be object and it should not be empty"));
  } else if (
    Object.values(req.body).filter((value) => {
      return value === "" || value === " ";
    }).length > 0
  ) {
    next(
      formatError(422, "Check the values Provided values should not be empty")
    );
  } else {
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
        } else if (result[0].password !== password) {
          next(formatError(401, "Password not matched"));
        } else {
          let jwt_token = jwt.sign({ username: username }, "secrete-key", {
            expiresIn: 86400,
          });
          res.json({
            message: "Login successfull",
            jwt_token: jwt_token,
          });
        }
      }
    });
  }
});

export default router;
