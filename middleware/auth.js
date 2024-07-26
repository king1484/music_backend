import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ error: true, message: "Access denied: No token provided!" });
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("token verified");
    next();
  } catch (err) {
    console.log("token not");
    return res.status(401).json({
      error: true,
      message: "Access denied: Invalid token!",
    });
  }
};

export default auth;
