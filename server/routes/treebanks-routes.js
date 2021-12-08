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

// route to get a url to download a treebank
router.post(
  "/download-treebank",
  treebanksController.apiCreateExportedTreebank
);

// route to get a url to download search results
router.post("/download-results", treebanksController.apiCreateExportedResults);

// route to download a file
router.get("/download/:fileName", treebanksController.downloadFile);

module.exports = router;
