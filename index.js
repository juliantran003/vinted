const express = require("express");
const app = express();
const formidable = require("express-formidable");
app.use(formidable());
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

mongoose.connect("mongodb://localhost/vinted", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.all("*", (req, res) => {
  console.log("app.all");
  res.status(404).json("Page not found");
});

app.listen(3000, () => {
  console.log("Server started");
});
