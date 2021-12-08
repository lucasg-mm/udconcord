// requires
const express = require("express");
const router = express.Router();
const treebanksController = require("../controllers/treebanks-controller");

// route to create a treebank by uploading it
router.post("/", treebanksController.apiCreateTreebank);

// route to search for a search (lemma, form, etc) in the treebank
router.post("/search", treebanksController.apiSearchTreebank);

// route to update a sentence in a treebank
router.post("/update", treebanksController.apiUpdateSentence);

// route to stream treebank in order for the user to download it
router.post("/download-treebank", treebanksController.apiStreamTreebank);

// route to stream the search results in order for the user to download it
router.post("/download-results", treebanksController.apiStreamResults);

module.exports = router;
