import express from "express";
import movies from "./routes/movies.js";
import createError from "http-errors";

const app = express();

app.use(express.json());

app.use("/", movies);

//handle 404 errors
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.json(err.messageObj || { status: "Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server listining to port", PORT);
});

export default app;
