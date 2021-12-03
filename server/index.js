// requires
const express = require("express");
const formidableMiddleware = require("express-formidable");
const treebanksRouter = require("./routes/treebanks-routes");
const mongoose = require("mongoose");

// declaring the express app and using middlewares
const app = express();
app.use(
  formidableMiddleware({
    maxFileSize: 2000 * 1024 * 1024,
  })
);

// connect to MongoDB database
const mongoUser = "root";
const mongoPass = "example";
mongoose
  .connect("mongodb://mongo:27017/udconcord", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: { username: mongoUser, password: mongoPass },
    authSource: "admin",
  })
  .then((res) => {
    console.log("Connected successfully to the database!");
  })
  .catch((err) => {
    console.log("Failed to connect to the database!");
    console.log(err);
  });

// using the routes
app.use("/treebanks", treebanksRouter);

// listening on the port 5000
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
