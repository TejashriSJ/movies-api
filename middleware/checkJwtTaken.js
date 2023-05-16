import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import sqlQuery from "../utils/sqlQuery.js";
import formatError from "../utils/formatError.js";

dotenv.config();

const checkJwtTokens = (req, res, next) => {
  let authorisationHeader = req.headers["authorization"];

  if (authorisationHeader === undefined) {
    next(
      formatError(
        400,
        "This request requires authorization, don't have access token? -> /api/auth/signin "
      )
    );
  } else {
    let token = authorisationHeader.split(" ")[1];
    if (token === undefined) {
      next(formatError(401, "Invalid access token"));
    } else if (
      jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
        if (err) {
          console.log(err, "Error in verifying token");
          next(formatError(401, "Unauthorised access token"));
        } else {
          req.username = payload.username;

          let sql = `select role from users inner join roles on users.role_id = roles.id where username = ? `;
          let parameters = payload.username;

          sqlQuery(sql, parameters)
            .then((result) => {
              req.role = result[0].role;
              next();
            })
            .catch((err) => {
              console.error(err, "error in getting role");
              next(err);
            });
        }
      })
    ) {
    }
  }
};

export default checkJwtTokens;
