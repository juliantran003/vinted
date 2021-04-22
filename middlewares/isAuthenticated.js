const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = async (req, res, next) => {
  console.log("Using middleware");
  const token = req.headers.authorization.replace("Bearer ", "");
  const user = await User.findOne({ token: token });

  if (user.token === token) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
