// middlewares/auth.js
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return next({
        status: 401,
        message: "Missing or invalid Authorization header",
      });
    }

    const token = header.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // guardamos el usuario en la request
    req.user = {
      id: payload.id,
      username: payload.username,
    };

    next();
  } catch (err) {
    return next({
      status: 401,
      message: "Invalid or expired token",
    });
  }
}

module.exports = auth;
