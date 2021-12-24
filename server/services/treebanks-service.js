const conlluJsLibrary = require("conllujs");
const fs = require("fs");

// saves a conllu object as json named userId.json
exports.saveConlluObj = async (conlluObj, userId) => {
  fs.writeFileSync(`/uploads/${userId}.json`, JSON.stringify(conlluObj));
  return;
};

// saves a temp exported text file
exports.saveTempFile = async (text, extension, userId) => {
  const fileName = `export-${userId}.${extension}`;
  fs.writeFileSync(`/uploads/${fileName}`, text);
  return fileName;
};

// gets conllu object according to user id
exports.getConlluObj = async (userId) => {
  // gets json string
  let conlluObj = fs.readFileSync(`/uploads/${userId}.json`);

  // parses json to object
  conlluObj = JSON.parse(conlluObj);

  return conlluObj;
};

// converts an object to .conllu text
exports.parseObjectToConllu = async (sentences) => {
  let conlluText = "";

  sentences.forEach((sentence) => {
    // builds metadata part
    sentence.metadata.forEach((pair) => {
      conlluText += `# ${pair.key}`;

      // just writes value if the line is not a singly
      if (pair.value) {
        conlluText += ` = ${pair.value}`;
      }

      conlluText += "\n";
    });

    // builds tokens part (each line is a token)
    sentence.tokens.forEach((token) => {
      conlluText += `${token.id}\t${token.form}\t${token.lemma}\t${token.upostag}\t${token.xpostag}\t${token.feats}\t${token.head}\t${token.deprel}\t${token.deps}\t${token.misc}\n`;
    });

    // a line break after each sentence
    conlluText += "\n";
  });

  return conlluText;
};

// parses the text of a CoNLL-U file to a array of objects.
exports.parseConlluToObject = async (conlluData) => {
  // instantiates a new CoNLL-U object
  const conlluObject = new conlluJsLibrary.Conllu();

  // makes the object assume the form of the data
  // specified in the conlluData variable
  conlluObject.serial = conlluData;

  // return an array of objects
  return conlluObject.sentences;
};

// updates a sentence in the treebank
exports.updateSentence = async (sentenceObj, treebank) => {
  const sentenceObjSentId = getSentId(sentenceObj.metadata);
  let treebankSentenceSentId;

  for (let i = 0; i < treebank.length; i++) {
    if (treebank[i].metadata.length !== 0) {
      treebankSentenceSentId = getSentId(treebank[i].metadata);
      if (sentenceObjSentId === treebankSentenceSentId) {
        treebank[i] = sentenceObj;
        break;
      }
    }
  }

  return treebank;
};

// Searched treebank
exports.searchTreebank = async (
  sentences,
  logicalConditions,
  n,
  page = 0,
  rowsNum = 100,
  exportFormat = ""
) => {
  // variable to store search results
  const searchResults = [];

  // separate words forming the n-gram and its searched properties
  const nGramToSearch = [];
  for (let i = 0; i < n; i++) {
    nGramToSearch.push([]);
    logicalConditions.forEach((logicalCondition) => {
      nGramToSearch[i].push({
        negate: logicalCondition.negate,
        prop: logicalCondition.propertyToSearch,
        logType: logicalCondition.type,
        value: logicalCondition.queryString[i],
        caseWay: logicalCondition.caseWay,
      });
    });
  }

  // iterates through the sentences array
  for (const sentence of sentences) {
    // iterates through the tokens of a sentence
    for (
      let i = 0;
      i < sentence["tokens"].length - nGramToSearch.length + 1;
      i++
    ) {
      // checks the n-gram equality
      if (nGramEquality(nGramToSearch, sentence["tokens"], i)) {
        // gets the ids of the matched tokens
        const matchesIds = getMatchesIds(i, nGramToSearch.length);

        // creates the sentence's corresponding entry
        // in the array and pushes the found token's id in it
        let result = {
          foundNGram: matchesIds,
          foundSentence: sentence,
        };
        if (exportFormat === "") {
          searchResults.push(result);
        } else if (exportFormat === "conllu") {
          searchResults.push(sentence);
          break; // just includes the conllu once
        } else if (exportFormat === "csv") {
          searchResults.push(
            `"${getLeftContext(result)}", "${getMatch(
              result
            )}", "${getRightContext(result)}"`
          );
        } else if (exportFormat === "txt") {
          searchResults.push(
            `${getLeftContext(result)} *****${getMatch(
              result
            )}***** ${getRightContext(result)}`
          );
        }
      }
    }
  }

  // returns the search results
  if (exportFormat === "") {
    let firstItem = (page - 1) * rowsNum;
    let lastItem = page * rowsNum;
    const numResults = searchResults.length;

    return {
      searchResults: searchResults.slice(firstItem, lastItem),
      numResults,
    };
  } else {
    return searchResults;
  }
};

// -- AUX FUNCTIONS

function getMatch(result) {
  const resultSentence = result.foundSentence;
  return result["foundNGram"]
    .map((tokenId) => {
      return resultSentence.tokens[tokenId].form;
    })
    .join(" ");
}

function getRightContext(result) {
  const resultSentence = result.foundSentence;

  return resultSentence.tokens
    .slice(
      result["foundNGram"][result["foundNGram"].length - 1] + 1,
      resultSentence.tokens.length
    )
    .map((e) => {
      return e.form;
    })
    .join(" ");
}

function getLeftContext(result) {
  // gets the left context (string)
  const resultSentence = result.foundSentence;
  return resultSentence.tokens
    .slice(0, result["foundNGram"][0])
    .map((e) => {
      return e.form;
    })
    .join(" ");
}

function featsComparison(tokenFeats, featsToCompare) {
  let numberOfMatchs = 0;

  // splits the feats that should be searched
  featsToCompare = featsToCompare.split("|");

  for (let i = 0; i < featsToCompare.length; i++) {
    // mounts the regex
    const re = new RegExp(featsToCompare[i]);

    // determines if the feat is present in the analyzed token
    if (re.test(tokenFeats)) {
      numberOfMatchs++;
    }
  }

  // returns true if every feat matched with something
  return featsToCompare.length === numberOfMatchs;
}

// check a value in the logical expression
// provided by the user
function checkLogConditions(conds, props) {
  let logStr = conds.reduce((prev, curr, index) => {
    // getting the right operator
    let op = curr["logType"] || "";
    op = op === "and" ? "&&" : op === "or" ? "||" : "";
    op = index === 0 ? "" : op;

    // gets the comparison sign
    let compSign = curr["negate"] ? "!==" : "===";

    // getting the searched value
    let searchedVal =
      curr["caseWay"] === "sensitive"
        ? curr["value"]
        : curr["value"].toLowerCase();

    // getting the compared value (the one in the treebank)
    let val = props[curr["prop"]];
    let compVal =
      curr["caseWay"] === "sensitive"
        ? val
        : curr["caseWay"] === "insensitive"
        ? val.toLowerCase()
        : "";

    if (curr["prop"] === "feats") {
      const featsRes = featsComparison(compVal, searchedVal);

      // escape backslashes
      searchedVal = searchedVal.replace(/\\/g, "\\\\");

      // escape double quotes
      searchedVal = searchedVal.replace(/"/g, '\\"');
      return `${prev} ${op} (${featsRes} ${compSign} true || "${searchedVal}" === "[any]")`;
    } else {
      // escape backslashes
      searchedVal = searchedVal.replace(/\\/g, "\\\\");

      // escape double quotes
      searchedVal = searchedVal.replace(/"/g, '\\"');

      // escape backslashes
      compVal = compVal.replace(/\\/g, "\\\\");

      // escape double quotes
      compVal = compVal.replace(/"/g, '\\"');

      return `${prev} ${op} ("${searchedVal}" ${compSign} "${compVal}" || "${searchedVal}" === "[any]")`;
    }
  }, "");

  return eval(logStr);
}

// Checks n-gram equality
function nGramEquality(nGram, sequence, start) {
  let numberOfMatches = 0;

  //iterates through tokens in the n-gram
  for (let i = 0; i < nGram.length; i++) {
    if (checkLogConditions(nGram[i], sequence[start + i])) {
      numberOfMatches++;
    }
  }
  return nGram.length === numberOfMatches;
}

// Get 'n' ids starting at 'start'.
function getMatchesIds(start, n) {
  const matchesIds = [];

  for (let i = start; i < start + n; i++) {
    matchesIds.push(i);
  }

  return matchesIds;
}

// get the sent_id from a sentence's metadata
function getSentId(metadata) {
  return metadata.find((meta) => meta.key === "sent_id").value;
}
