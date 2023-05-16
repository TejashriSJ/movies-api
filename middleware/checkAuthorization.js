import formatError from "../utils/formatError.js";

const checkAuthorization = (req, res, next) => {
  const role = req.role;
  if (role === "admin") {
    next();
  } else {
    next(formatError(403, "This field requires admin role."));
  }
};

export default checkAuthorization;
