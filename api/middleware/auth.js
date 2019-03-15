import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ status: "401", message: 'Access denied. No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  }
  catch (ex) {
    res.status(400).json({ status: "400", message: 'Invalid token' });
  }
}

export default auth;
