require("dotenv").config();
const express = require("express");
const app = express();
const formidable = require("express-formidable");
app.use(formidable());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "juliantran",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.all("*", (req, res) => {
  console.log("app.all");
  res.status(404).json("Page not found");
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
