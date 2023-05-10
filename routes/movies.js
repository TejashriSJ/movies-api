import express from "express";
import mysql from "mysql";

const router = express.Router();

// create connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "tejashri",
  password: "Teju@123",
  database: "movies_db",
});

connection.connect((err) => {
  if (err) {
    console.error("error in connecting: ", err);
  } else {
    console.log("connected to data base");
  }
});

const formatError = (statusCode, messageForClient) => {
  let error = {
    status: statusCode,
    messageObj: { status: "Error", Message: messageForClient },
  };
  return error;
};

// Get all movies
router.get("/api/movies", (req, res, next) => {
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
router.get("/api/movies/:movieId", (req, res, next) => {
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
router.post("/api/movies", (req, res, next) => {
  let sql = `INSERT into movies set ?`;

  console.log(typeof req.body);

  if (
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    next(formatError(400, "Body should be object and it should not be empty"));
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
              `Unable to process the given data check the fields provided`
            )
          );
        } else {
          next(formatError(500, `Unable to add new movie data`));
        }
      } else {
        res.json({ status: "success", message: "Movie added" });
      }
    });
  }
});

//Update the movie with given ID
router.put("/api/movies/:movieId", (req, res, next) => {
  let movie_id = req.params.movieId;
  let newData = req.body;

  if (!Number(movie_id)) {
    next(formatError(400, "Id should be a number"));
  } else if (
    typeof newData !== "object" ||
    Array.isArray(newData) ||
    Object.keys(newData).length === 0
  ) {
    next(formatError(400, "Body should be object and it should not be empty"));
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
        next(formatError(500, `Unable to update id ${movie_id} movie data`));
      } else {
        console.log(result);
        console.log(result.affectedRows);
        if (result.affectedRows === 0) {
          next(formatError(400, `Id not matched with the present data `));
        } else {
          res.json({ status: "success", message: "Movie data updated" });
        }
      }
    });
  }
});

//Delete the movie with given ID

router.delete("/api/movies/:movieId", (req, res, next) => {
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
});

export default router;
