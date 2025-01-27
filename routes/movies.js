import express from "express";

import sqlQuery from "../utils/sqlQuery.js";
import formatError from "../utils/formatError.js";

import movieIdSchema from "../schema/movieIdSchema.js";
import validateMovieId from "../middleware/validateMovieId.js";

import addMovieSchema from "../schema/addMovieSchema.js";
import validateAddMovierequest from "../middleware/validateAddMovieRequest.js";

import updateMovieSchema from "../schema/updateMovieSchema.js";
import validateUpdateMovieRequest from "../middleware/validateUpdateMovieRequest.js";

import checkAuthorization from "../middleware/checkAuthorization.js";

const router = express.Router();

// Get all movies
router.get("/", (req, res, next) => {
  let getMoviesQuery = `SELECT * from movies`;

  sqlQuery(getMoviesQuery)
    .then((results) => {
      res.json({ movies: results });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

// Get the movies with given id
router.get("/:movieId", movieIdSchema, validateMovieId, (req, res, next) => {
  const movie_id = req.params.movieId;
  // SQL Injection
  let getMovieQuery = `SELECT * from movies where id = ? `;
  let parameters = movie_id;

  sqlQuery(getMovieQuery, parameters)
    .then((result) => {
      if (result.length === 0) {
        next(formatError(400, `No data for given id ${movie_id}`));
      } else {
        res.json(result);
      }
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

//Add a new movie
router.post(
  "/",
  checkAuthorization,
  addMovieSchema,
  validateAddMovierequest,
  (req, res, next) => {
    let addMovieQuery = `INSERT into movies set ?`;

    sqlQuery(addMovieQuery, req.body)
      .then((result) => {
        let getMovieQuery = `SELECT * from movies where id = ?`;

        return sqlQuery(getMovieQuery, result.insertId);
      })
      .then((result) => {
        res.json({
          status: "success",
          message: "Movie added",
          addedMovie: result,
        });
      })
      .catch((err) => {
        console.error(err, "error in adding a new movie");
        next(err);
      });
  }
);

//Update the movie with given ID
router.put(
  "/:movieId",
  checkAuthorization,
  movieIdSchema,
  validateMovieId,
  updateMovieSchema,
  validateUpdateMovieRequest,
  (req, res, next) => {
    let movie_id = req.params.movieId;

    let updateMovieQuery = `UPDATE movies set ? where id = ?`;
    let parameters = [req.body, movie_id];

    sqlQuery(updateMovieQuery, parameters)
      .then((result) => {
        if (result.affectedRows === 0) {
          next(formatError(400, `Id not matched with the present data `));
        } else {
          let getMovieQuery = `SELECT * from movies where id = ?`;
          return sqlQuery(getMovieQuery, movie_id);
        }
      })
      .then((result) => {
        res.json({
          status: "success",
          message: "Movie data updated",
          updatedMovie: result,
        });
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  }
);

//Delete the movie with given ID

router.delete(
  "/:movieId",
  checkAuthorization,
  movieIdSchema,
  validateMovieId,
  (req, res, next) => {
    const movie_id = req.params.movieId;

    let movieToBeDeleted = {};

    let getMovieQuery = `SELECT * from movies where id = ?`;
    sqlQuery(getMovieQuery, movie_id)
      .then((result) => {
        if (result.length === 0) {
          next(formatError(400, `Id not matched with the present data`));
        } else {
          movieToBeDeleted = result;
          let deleteMovieQuery = `DELETE from movies where id = ? `;
          sqlQuery(deleteMovieQuery, movie_id)
            .then(() => {
              res.send({
                status: "success",
                message: "movie deleted",
                deletedMovie: movieToBeDeleted,
              });
            })
            .catch((err) => {
              console.error(err);
              next(err);
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
