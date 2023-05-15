import { param } from "express-validator";

const movieIdSchema = param("movieId").isInt({ min: 1 });

export default movieIdSchema;
