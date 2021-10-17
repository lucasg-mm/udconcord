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

/**
 * TODO
 */
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

/**
 * -- DESCRIPTION:
 * Searches in a treebank.
 *
 * -- REQUEST'S BODY:
 * sentences: array of UD sentences (must be like the one in the
 *            response of the POST endpoint at the /treebanks route);
 * propertyToSearch: the property to be searched;
 * valueToSearch: FORM's (for now) value to be searched.
 * caseWay: indicates if the comparisson will be made in case sensitive or
 *          insensitive way. Can be "sensitive" or "insensitive".
 *
 * -- RESPONSE:
 * HTTP response with the appropriate response code and a JSON.
 * The JSON can be:
 *     - In case of success:
 *        Array of objects. Each one represents a sentence in the CoNLL-U file.
 *        Each object has the form
 *        {
 *           foundNGram (the found n-gram in the sentence)
 *           sentenceIndex (the index of the found sentence in the 'sentences' array)
 *        }
 *
 *     - In case of error: object with a message and a nested error object.
 */
exports.apiSearchTreebank = async (req, res, next) => {
  try {
    // gets the request's properties
    const { sentences, logicalAndConditions, caseWay } = req.fields;

    // should hold the number of tokens in the searched n-gram
    let n;

    // validation set
    let valSet = new Set();

    // spliting the query string per token
    logicalAndConditions.forEach((logicalAndCondition) => {
      logicalAndCondition.queryString =
        logicalAndCondition.queryString.split(" ");

      if (
        logicalAndCondition.queryString.length === 1 &&
        logicalAndCondition.queryString[0] === ""
      ) {
        logicalAndCondition.queryString = [];
      }

      valSet.add(logicalAndCondition.queryString.length);
    });

    // validates inputs
    if (valSet.size !== 1) {
      res
        .status(400)
        .json({ message: "Please, insert property values for every token." });
    }

    n = logicalAndConditions[0].queryString.length;

    if (n === 0) {
      res.status(400).json({ message: "You have to search for something." });
    }

    // makes the search
    const searchResults = await treebanksService.searchTreebank(
      sentences,
      logicalAndConditions,
      n,
      caseWay
    );

    // returns search results
    res.json(searchResults);
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

/**
 * -- DESCRIPTION:
 * Creates a new treebank.
 *
 * -- REQUEST'S BODY:
 * conlluFile: a CoNLL-U file.
 *
 * -- RESPONSE:
 * HTTP response with the appropriate response code and a JSON.
 * The JSON can be:
 *     - In case of success: array of objects, each one representing a sentence in the treebank.
 *     - In case of error: object with a message and a nested error object.
 */
exports.apiCreateTreebank = async (req, res, next) => {
  try {
    // we're using a middleware that stores temporarely
    // the uploaded conllu file in our file system
    // the variable below holds the path to this temp file
    const conlluTempFilePath = req.files.conlluFile.path;

    // data from the uploaded conllu file (its text)
    const conlluData = fs.readFileSync(conlluTempFilePath, "utf8");

    // remove the temporary file
    fs.unlinkSync(conlluTempFilePath);

    // parse the uploaded conllu file text to
    // an array of sentence objects
    const createdTreebank = await treebanksService.parseConlluToObject(
      conlluData
    );

    // send to the client the object representing the treebank
    res.json(createdTreebank);
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};
