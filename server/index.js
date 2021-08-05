const express = require("express");

// declaring the express app
const app = express();

// just for testing
app.get("/", (req, res) => {
  console.log("All righty!");
  res.send({ message: "okay!" });
});

// listening on the port specified in the .env file
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
