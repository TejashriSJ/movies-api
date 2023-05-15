import express from "express";
import connection from "../config/connection.js";

import checkJwtTokens from "../middleware/checkJwtTaken.js";

const router = express.Router();

const formatError = (statusCode, messageForClient) => {
  let error = {
    status: statusCode,
    messageObj: { status: "Error", Message: messageForClient },
  };
  return error;
};

// Get all movies
router.get("/", (req, res, next) => {
  let sql = `SELECT * from movies`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err, "error in getting movies");
      next(formatError(500, "Unable to get movies data"));
    } else {
      res.json({ movies: results });
    }
  });
});

// Get the movies with given id
router.get("/:movieId", (req, res, next) => {
  let movie_id = req.params.movieId;
  let sql = `SELECT * from movies where id = ${movie_id}`;

  if (!Number(movie_id)) {
    next(formatError(400, `Id should be a number`));
  } else {
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(err, `error in getting ${movie_id} movie data`);
        next(formatError(500, `Unable to get id ${movie_id} movie data `));
      } else {
        if (result.length === 0) {
          next(formatError(400, `No data for given id ${movie_id}`));
        } else {
          res.json(result);
        }
      }
    });
  }
});

//Add a new movie
router.post("/", (req, res, next) => {
  const role = req.role;

  if (role === "admin") {
    let sql = `INSERT into movies set ?`;

    if (
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      next(
        formatError(400, "Body should be object and it should not be empty")
      );
    } else if (
      Object.values(req.body).filter((value) => {
        return value === "" || value === " ";
      }).length > 0
    ) {
      next(
        formatError(422, "Check the values Provided values should not be empty")
      );
    } else {
      connection.query(sql, req.body, (err, result) => {
        if (err) {
          console.error(err, "error in adding a new movie");
          if (
            err.code === "ER_BAD_FIELD_ERROR" ||
            err.code === "WARN_DATA_TRUNCATED" ||
            err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD"
          ) {
            next(
              formatError(
                422,
                `Unable to process the given data check the fields and values provided`
              )
            );
          } else if (err.code === "ER_DUP_ENTRY") {
            next(
              formatError(
                422,
                "Duplicate ID, provide different ID or remove the ID field"
              )
            );
          } else if (err.code === "ER_NO_DEFAULT_FOR_FIELD") {
            next(formatError(422, "Provide all the fields"));
          } else if (err.code === "UNKNOWN_CODE_PLEASE_REPORT") {
            next(formatError(422, "Rating should be between 0 and 10"));
          } else {
            next(formatError(500, `Unable to add new movie data`));
          }
        } else {
          res.json({ status: "success", message: "Movie added" });
        }
      });
    }
  } else {
    next(formatError(403, "Only admins can access this resource"));
  }
});

//Update the movie with given ID
router.put("/:movieId", (req, res, next) => {
  const role = req.role;

  if (role === "admin") {
    let movie_id = req.params.movieId;
    let newData = req.body;

    if (!Number(movie_id)) {
      next(formatError(400, "Id should be a number"));
    } else if (
      typeof newData !== "object" ||
      Array.isArray(newData) ||
      Object.keys(newData).length === 0
    ) {
      next(
        formatError(400, "Body should be object and it should not be empty")
      );
    } else if (
      Object.values(req.body).filter((value) => {
        return value === "" || value === " ";
      }).length > 0
    ) {
      next(
        formatError(422, "Check the values Provided values should not be empty")
      );
    } else {
      let dataForUpdate = Object.keys(newData).reduce((dataString, key) => {
        dataString += `${key} = "${newData[key]}",`;
        return dataString;
      }, "");

      // Will remove the extra comma at the end
      dataForUpdate = dataForUpdate.slice(0, dataForUpdate.length - 1);
      let sql = `UPDATE movies set ${dataForUpdate} where id = "${movie_id}"`;

      connection.query(sql, (err, result) => {
        if (err) {
          console.error(err, "error in updating data");
          if (
            err.code === "ER_BAD_FIELD_ERROR" ||
            err.code === "WARN_DATA_TRUNCATED" ||
            err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD"
          ) {
            next(
              formatError(
                422,
                `Unable to process the given data check the fields and values provided`
              )
            );
          } else if (err.code === "UNKNOWN_CODE_PLEASE_REPORT") {
            next(formatError(422, "Rating should be between 0 and 10"));
          } else {
            next(
              formatError(500, `Unable to update id ${movie_id} movie data`)
            );
          }
        } else {
          if (result.affectedRows === 0) {
            next(formatError(400, `Id not matched with the present data `));
          } else {
            res.json({ status: "success", message: "Movie data updated" });
          }
        }
      });
    }
  } else {
    next(formatError(403, "Only admins can access this resource"));
  }
});

//Delete the movie with given ID

router.delete("/:movieId", (req, res, next) => {
  const role = req.role;
  if (role === "admin") {
    let movie_id = req.params.movieId;
    let sql = `DELETE from movies where id = ${movie_id}`;

    if (!Number(movie_id)) {
      next(formatError(400, `Id should be a number`));
    } else {
      connection.query(sql, (err, result) => {
        if (err) {
          console.error(err, "error in deleting the data");
          next(formatError(500, `Unable to delete movie of id ${movie_id}`));
        } else {
          if (result.affectedRows === 0) {
            next(formatError(400, `Id not matched with the present data`));
          } else {
            res.send({ status: "success", message: "movie deleted" });
          }
        }
      });
    }
  } else {
    next(formatError(403, "Only admins can access this resource"));
  }
});

export default router;
