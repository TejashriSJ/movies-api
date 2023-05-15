import express from "express";
import movies from "./routes/movies.js";
import users from "./routes/users.js";
import createError from "http-errors";

import checkJwtTokens from "./middleware/checkJwtTaken.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/movies", checkJwtTokens);

// home page
app.get("/", (req, res, next) => {
  res.json({ Message: "Home Page" });
});

app.use("/api/movies", movies);
app.use("/api/auth", users);

//handle 404 errors
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.json(err.messageObj || { status: "Error" });
});

app.listen(PORT, () => {
  console.log("server listining to port", PORT);
});

export default app;
