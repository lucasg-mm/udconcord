const treebanksService = require("../services/treebanks-service");
const fs = require("fs");
const stream = require("stream");

// --- POST REQUESTS ---

exports.apiResultsToCSV = async (req, res, next) => {
  try {
    // gets the request's properties
    const { organizedResults, fileExtension } = req.fields;

    // parses the results to text
    let resultsText;
    if (fileExtension === "csv") {
      resultsText = await treebanksService.parseResultsToCSV(organizedResults);
    } else {
      resultsText = await treebanksService.getResultsStringRepresentation(
        organizedResults
      );
    }

    // returns the text file
    let fileContents = Buffer.from(resultsText, "utf-8");

    let readStream = new stream.PassThrough();
    readStream.end(fileContents);

    res.set(
      "Content-disposition",
      `attachment; filename=results.${fileExtension}`
    );
    res.set("Content-Type", "text/plain");

    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error });
  }
};

exports.apiParseTreebank = async (req, res, next) => {
  try {
    // gets the request's properties
    const { sentences } = req.fields;

    // parses the object to conllu text
    const conlluText = await treebanksService.parseObjectToConllu(sentences);

    // returns the text file
    let fileContents = Buffer.from(conlluText, "utf-8");

    let readStream = new stream.PassThrough();
    readStream.end(fileContents);

    res.set(
      "Content-disposition",
      "attachment; filename=edited-treebank.conllu"
    );
    res.set("Content-Type", "text/plain");

    readStream.pipe(res);
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// receives request to search the treebank
exports.apiSearchTreebank = async (req, res, next) => {
  try {
    // gets the request's properties
    const { sentences, logicalConditions } = req.fields;

    // should hold the number of tokens in the searched n-gram
    let n;

    // validation set
    let valSet = new Set();

    // spliting the query string per token
    logicalConditions.forEach((logicalCondition) => {
      logicalCondition.queryString = logicalCondition.queryString.trim();

      logicalCondition.queryString =
        logicalCondition.queryString.split(/[ ]+/g);

      if (
        logicalCondition.queryString.length === 1 &&
        logicalCondition.queryString[0] === ""
      ) {
        logicalCondition.queryString = [];
      }

      valSet.add(logicalCondition.queryString.length);
    });

    // validates inputs
    if (valSet.size !== 1) {
      res
        .status(400)
        .json({ message: "Please, insert property values for every token." });
    }

    n = logicalConditions[0].queryString.length;

    if (n === 0) {
      res.status(400).json({ message: "You have to search for something." });
    }

    // makes the search
    const searchResults = await treebanksService.searchTreebank(
      sentences,
      logicalConditions,
      n
    );

    // returns search results
    res.json(searchResults);
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// Creates a new treebank.
exports.apiCreateTreebank = async (req, res, next) => {
  try {
    // we're using a middleware that stores temporarely
    // the uploaded conllu file in our file system
    // the variable below holds the path to this temp file
    const conlluTempFilePath = req.files.conlluFile.path;

    // data from the uploaded conllu file (its text)
    const conlluData = fs.readFileSync(conlluTempFilePath, "utf8");

    // gets the user's id
    const { userId } = req.fields;

    // remove the temporary file
    fs.unlinkSync(conlluTempFilePath);

    // parse the uploaded conllu file text to
    // an array of sentence objects
    const createdTreebank = await treebanksService.parseConlluToObject(
      conlluData
    );

    // stores treebank and user in the db
    await treebanksService.storeUser(userId, createdTreebank);

    // send to the client the object representing the treebank
    res.json({ message: "Success!" });
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};
