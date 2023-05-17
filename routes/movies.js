import express from "express";

import sqlQuery from "../utils/sqlQuery.js";
import formatError from "../utils/formatError.js";

import movieIdSchema from "../schema/movieIdSchema.js";
import validateMovieId from "../middleware/validateMovieId.js";

import addMovieSchema from "../schema/addMovieSchema.js";
import validateAddMovierequest from "../middleware/validateAddMovieRequest.js";

import checkAuthorization from "../middleware/checkAuthorization.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = express.Router();

// Get all movies
router.get("/", async (req, res, next) => {
  try {
    const movies = await prisma.movies.findMany();

    res.json({ movies: movies });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Get the movies with given id
router.get(
  "/:movieId",
  movieIdSchema,
  validateMovieId,
  async (req, res, next) => {
    try {
      const movie_id = req.params.movieId;
      const movie = await prisma.movies.findUnique({
        where: {
          id: Number(movie_id),
        },
      });
      if (!movie) {
        next(formatError(400, `No data for given id ${movie_id}`));
      } else {
        res.json(movie);
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//Add a new movie
router.post(
  "/",
  checkAuthorization,
  addMovieSchema,
  validateAddMovierequest,
  async (req, res, next) => {
    try {
      const insertedMovie = await prisma.movies.create({
        data: req.body,
      });
      res.json({
        status: "success",
        message: "Movie added",
        addedMovie: insertedMovie,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//Update the movie with given ID
router.put(
  "/:movieId",
  checkAuthorization,
  movieIdSchema,
  validateMovieId,
  addMovieSchema,
  validateAddMovierequest,
  async (req, res, next) => {
    try {
      const movie_id = req.params.movieId;

      const checkIdExist = await prisma.movies.findUnique({
        where: { id: Number(movie_id) },
      });
      if (checkIdExist) {
        const updatedMovie = await prisma.movies.update({
          where: {
            id: Number(movie_id),
          },
          data: req.body,
        });
        res.json({
          status: "success",
          message: "Movie data updated",
          updatedMovie: updatedMovie,
        });
      } else {
        next(formatError(400, `Id not matched with the present data `));
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//Delete the movie with given ID

router.delete(
  "/:movieId",
  checkAuthorization,
  movieIdSchema,
  validateMovieId,
  async (req, res, next) => {
    try {
      const movie_id = req.params.movieId;

      const checkIdExist = await prisma.movies.findUnique({
        where: { id: Number(movie_id) },
      });
      if (checkIdExist) {
        const deletedMovie = await prisma.movies.delete({
          where: {
            id: Number(movie_id),
          },
        });
        res.send({
          status: "success",
          message: "movie deleted",
          deletedMovie: deletedMovie,
        });
      } else {
        next(formatError(400, `Id not matched with the present data `));
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;
