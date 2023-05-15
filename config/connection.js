import mysql from "mysql";

const connection = mysql.createPool({
  host: "bwurplvdgvvvwpnranif-mysql.services.clever-cloud.com",
  user: "udqqzprkaengukj7",
  password: "EOs778HMHx1GmqWriFwH",
  database: "bwurplvdgvvvwpnranif",
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
