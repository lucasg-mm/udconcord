// requires
const express = require("express");
const router = express.Router();
const treebanksController = require("../controllers/treebanks-controller");

// route to create a treebank by uploading it
router.post("/", treebanksController.apiCreateTreebank);

// route to search for a search (lemma, form, etc) in the treebank
router.post("/search", treebanksController.apiSearchTreebank);

// route to edit a sentence from a treebank
router.post("/edit", treebanksController.apiEditTreebank);

module.exports = router;
