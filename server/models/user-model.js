const mongoose = require("mongoose");
const Sentence = require("./sentence-model").schema;

// declares the user schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  uploadedTreebank: [Sentence],
});

// export the schema as a model
module.exports = new mongoose.model("User", userSchema);
