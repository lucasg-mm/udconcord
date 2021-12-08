const treebanksService = require("../services/treebanks-service");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// --- POST REQUESTS ---

// create a temp file with the search results in the format passed by the client format
// sends back the url to download the file
exports.apiCreateExportedResults = async (req, res, next) => {
  try {
    const { userId, logicalConditions, format } = req.fields;

    // gets the right treebank to search in
    const sentences = await treebanksService.getConlluObj(userId);

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

    // get all search results
    let searchResults = await treebanksService.searchTreebank(
      sentences,
      logicalConditions,
      n,
      0,
      100,
      format
    );

    // get file's text
    if (format === "conllu") {
      searchResults = await treebanksService.parseObjectToConllu(searchResults);
    } else {
      searchResults = searchResults.join("\n");
    }

    // saves text as temp file
    const fileName = await treebanksService.saveTempFile(
      searchResults,
      format,
      userId
    );

    // sends back the file's name to build the download url
    res.json({ fileName: fileName });
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// download a file (through get request)
exports.downloadFile = async (req, res, next) => {
  try {
    // gets file's directory
    const fileName = req.params.fileName;
    const fileDir = "/uploads/" + fileName;

    // read file through stream
    let filestream = fs.createReadStream(fileDir);

    // delete file after read
    filestream.on("end", function () {
      fs.unlink(fileDir, function () {
        // file deleted
      });
    });

    // send file back to client as download
    res.set({
      "Content-Disposition": `attachment; filename=${fileName}`,
      "Content-Type": "text/plain",
    });

    filestream.pipe(res);
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// create a temp file with the treebank in conllu format
// sends back the url to download the file
exports.apiCreateExportedTreebank = async (req, res, next) => {
  try {
    // gets the request's properties
    const { userId } = req.fields;

    // parses the object to conllu text
    const sentences = await treebanksService.getConlluObj(userId);
    const conlluText = await treebanksService.parseObjectToConllu(sentences);

    // saves as temp file
    const fileName = await treebanksService.saveTempFile(
      conlluText,
      "conllu",
      userId
    );

    // sends url
    res.json({ fileName: fileName });
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// receives a request to update a sentence in a user's treebank
exports.apiUpdateSentence = async (req, res, next) => {
  try {
    // gets the request's properties
    const { sentenceObj, userId } = req.fields;

    // gets the right treebank to update
    const oldTreebank = await treebanksService.getConlluObj(userId);

    const newTreebank = await treebanksService.updateSentence(
      sentenceObj,
      oldTreebank
    );

    // saves the updates treebank in the file system
    await treebanksService.saveConlluObj(newTreebank, userId);

    res.json({ message: "Your changes have been successfully saved!" });
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// receives request to search the treebank
exports.apiSearchTreebank = async (req, res, next) => {
  try {
    // gets the request's properties
    const { logicalConditions, userId, page, rowsNum } = req.fields;

    // gets the right treebank to search in
    const sentences = await treebanksService.getConlluObj(userId);

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
      n,
      page,
      rowsNum
    );

    // returns search results
    res.json(searchResults);
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};

// Creates a new treebank.
// Parses uploaded .conllu to object.
// Parses object to json.
// Saves the .json version in the file system.
exports.apiCreateTreebank = async (req, res, next) => {
  try {
    // we're using a middleware that stores temporarely
    // the uploaded conllu file in our file system
    // the variable below holds the path to this temp file
    const conlluTempFilePath = req.files.conlluFile.path;
    const userId = uuidv4();

    // data from the uploaded conllu file (its text)
    const conlluData = fs.readFileSync(conlluTempFilePath, "utf8");

    // remove the temporary file
    fs.unlinkSync(conlluTempFilePath);

    // parse the uploaded conllu file text to
    // an array of sentence objects
    const createdTreebank = await treebanksService.parseConlluToObject(
      conlluData
    );

    // saves the created object as json in the file system
    await treebanksService.saveConlluObj(createdTreebank, userId);

    // send to the client their user id
    res.json({ userId });
  } catch (error) {
    // in case of error, send a message and the error object
    res.status(500).json({ message: "Internal error", error: error });
  }
};
