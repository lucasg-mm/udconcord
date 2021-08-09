const treebanksService = require("../services/treebanks-service");
const fs = require("fs");

// --- POST REQUESTS ---

/**
 * -- DESCRIPTION:
 * Searches in a treebank.
 *
 * -- REQUEST'S BODY:
 * sentences: array of UD sentences (must be like the one in the
 *            response of the POST endpoint at the /treebanks route);
 * propertyToSearch: the property to be searched (TODO...);
 * valueToSearch: FORM's (for now) value to be searched.
 *
 * -- RESPONSE:
 * HTTP response with the appropriate response code and a JSON.
 * The JSON can be:
 *     - In case of success: array of objects, each one with a found sentence
 *                           and a property with an array of indexes of the found
 *                           token which have the given FORM (for now).
 *     - In case of error: object with a message and a nested error object.
 */
exports.apiSearchTreebank = async (req, res, next) => {
  try {
    // gets the request's properties
    const { sentences, propertyToSearch, valueToSearch } = req.fields;

    // makes the search
    const searchResults = await treebanksService.searchTreebank(
      sentences,
      propertyToSearch,
      valueToSearch
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
