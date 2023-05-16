import connection from "../config/connection.js";

const sqlQuery = (sql, parameters) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, parameters, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export default sqlQuery;
