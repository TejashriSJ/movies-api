import express from "express";
import movies from "./routes/movies.js";
import createError from "http-errors";
import mysql from "mysql";

const app = express();

// create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "tejashri",
  password: process.env.DB_PASSWORD || "Teju@123",
  database: process.env.DB_DBNAME || "movies_db",
  waitForConnections: true,
  connectinLimit: 10,
  queueLimit: 0,
});

connection.connect((err) => {
  if (err) {
    console.error("error in connecting: ", err);
  } else {
    console.log("connected to data base");
  }
});

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
