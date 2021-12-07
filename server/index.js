// requires
const express = require("express");
const formidableMiddleware = require("express-formidable");
const treebanksRouter = require("./routes/treebanks-routes");

// declaring the express app and using middlewares
const app = express();
app.use(
  formidableMiddleware({
    maxFileSize: 2000 * 1024 * 1024,
  })
);

// using the routes
app.use("/treebanks", treebanksRouter);

// listening on the port 5000
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
