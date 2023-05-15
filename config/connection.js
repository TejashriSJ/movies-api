import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // host: "localhost",
  // user: "tejashri",
  // password: "Teju@123",
  // database: "movies_db",
});
connection.getConnection((err) => {
  if (err) {
    console.error("error in connecting: ", err);
  } else {
    console.log("connected to data base");
  }
});

export default connection;
