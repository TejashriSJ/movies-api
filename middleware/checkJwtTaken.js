import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import formatError from "../utils/formatError.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
    } else {
      jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
        try {
          if (err) {
            console.error(err, "Error in verifying token");
            next(formatError(401, "Unauthorised access token"));
          } else {
            req.username = payload.username;
            const roleName = await prisma.users.findUnique({
              where: {
                username: payload.username,
              },
              include: {
                role: {
                  select: {
                    role: true,
                  },
                },
              },
            });

            req.role = roleName.role.role;
            next();

            console.log(roleName, "role");
          }
        } catch (err) {
          console.error(err);
          next(err);
        }
      });
    }

    // jwt.verify(token, process.env.SECRET_KEY, async (err, payload) =>

    //       if (err) {
    //         console.log(err, "Error in verifying token");
    //         next(formatError(401, "Unauthorised access token"));
    //       } else {
    //         req.username = payload.username;
    //         console.log(payload.username, "username");

    //         const roleName = await prisma.users.findUnique({
    //           where: {
    //             username: payload.username,
    //           },
    //           include: {
    //             role: {
    //               select: {
    //                 role: true,
    //               },
    //             },
    //           },
    //         });

    //         console.log(roleName, "role");

    //       }
    // req.role = "admin";
    // let sql = `select role from users inner join roles on users.role_id = roles.id where username = ? `;

    // let parameters = payload.username;

    // sqlQuery(sql, parameters)
    //   .then((result) => {
    //     console.log(result);
    //     req.role = result[0].role;
    //     next();
    //   })
    //   .catch((err) => {
    //     console.error(err, "error in getting role");
    //     next(err);
    //   });

    //     })
  }
};

export default checkJwtTokens;
