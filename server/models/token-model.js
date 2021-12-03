const mongoose = require("mongoose");

// declares the user schema
const tokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  deprel: { type: String },
  deps: { type: String },
  feats: { type: String },
  form: { type: String },
  head: { type: String },
  lemma: { type: String },
  misc: { type: String },
  upostag: { type: String },
  xpostag: { type: String },
});

// export the schema as a model
module.exports = new mongoose.model("Token", tokenSchema);
