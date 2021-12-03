const mongoose = require("mongoose");

// declares the user schema
const metadataSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String },
});

// export the schema as a model
module.exports = new mongoose.model("Metadata", metadataSchema);
