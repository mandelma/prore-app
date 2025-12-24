const jwt = require("jsonwebtoken");

module.exports = function httpAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  console.log("AUTH HEADER:", auth);
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.SECRET);
    console.log("JWT PAYLOAD:", payload);
    req.user = { id: payload.id, username: payload.username };
    console.log("REQ.USER:", req.user);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};