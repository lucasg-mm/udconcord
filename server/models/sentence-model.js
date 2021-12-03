const mongoose = require("mongoose");
const Metadata = require("./metadata-model").schema;
const Token = require("./token-model").schema;

// declares the sentence schema
const sentenceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  metadata: [Metadata],
  tokens: [Token],
});

// export the schema as a model
module.exports = new mongoose.model("Sentence", sentenceSchema);
