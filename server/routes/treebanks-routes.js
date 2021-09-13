// requires
const express = require("express");
const router = express.Router();
const treebanksController = require("../controllers/treebanks-controller");

// route to create a treebank by uploading it
router.post("/", treebanksController.apiCreateTreebank);

// route to search for a search (lemma, form, etc) in the treebank
router.post("/search", treebanksController.apiSearchTreebank);

// route to parse a conll object to a conllu file
router.post("/parse", treebanksController.apiParseTreebank);

module.exports = router;
