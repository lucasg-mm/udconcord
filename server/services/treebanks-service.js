const conlluJsLibrary = require("conllujs");
const fs = require("fs");

// called when user wants to export search results as .txt
exports.getResultsStringRepresentation = (organizedResults) => {
  let finalText = "";
  // iterates through every sentence
  organizedResults.forEach((sentence) => {
    // iterates through every token in the left context
    sentence.leftContext.split("\xa0\xa0\xa0").forEach((token) => {
      finalText += getContextTokenText(token);
      finalText += " ";
    });

    // iterates through every token in the match
    finalText += "*****";
    const matchTokens = sentence.match.split("\xa0\xa0\xa0");
    matchTokens.forEach((token, index) => {
      finalText += getContextTokenText(token);
      if (index != matchTokens.length - 1) {
        finalText += " ";
      }
    });
    finalText += "***** ";

    // iterates through every token in the right context
    sentence.rightContext.split("\xa0\xa0\xa0").forEach((token) => {
      finalText += getContextTokenText(token);
      finalText += " ";
    });

    finalText += "\n\n\n";
  });

  return finalText;
};

exports.parseResultsToCSV = (organizedResults) => {
  let finalText = "Left Context,Match,Right Context\n";
  // iterates through every sentence
  organizedResults.forEach((sentence) => {
    // iterates through every token in the left context
    finalText += `"`;
    const leftContextTokens = sentence.leftContext.split("\xa0\xa0\xa0");
    leftContextTokens.forEach((token, index) => {
      finalText += getContextTokenText(token);
      if (index != leftContextTokens.length - 1) {
        finalText += " ";
      }
    });
    finalText += `","`;

    // iterates through every token in the match
    const matchTokens = sentence.match.split("\xa0\xa0\xa0");
    matchTokens.forEach((token, index) => {
      finalText += getContextTokenText(token);
      if (index != matchTokens.length - 1) {
        finalText += " ";
      }
    });
    finalText += `","`;

    // iterates through every token in the right context
    const rightContextTokens = sentence.rightContext.split("\xa0\xa0\xa0");
    rightContextTokens.forEach((token, index) => {
      finalText += getContextTokenText(token);
      if (index != rightContextTokens.length - 1) {
        finalText += " ";
      }
    });
    finalText += `"\n`;
  });

  return finalText;
};

// saves a conllu object as json named userId.json
exports.saveConlluObj = async (conlluObj, userId) => {
  fs.writeFileSync(`/uploads/${userId}.json`, JSON.stringify(conlluObj));
  return;
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

/**
 * -- DESCRIPTION:
 * Parses the text of a CoNLL-U file to a array of objects.
 *
 * -- PARAMETERS:
 * conlluData: string with the CoNLL-U's file text .
 *
 * -- RETURNS:
 * conlluObject.sentences: array of objects. Each one represents
 *                         a sentence in the CoNLL-U file.
 */
exports.parseConlluToObject = async (conlluData) => {
  // instantiates a new CoNLL-U object
  const conlluObject = new conlluJsLibrary.Conllu();

  // makes the object assume the form of the data
  // specified in the conlluData variable
  conlluObject.serial = conlluData;

  // return an array of objects
  return conlluObject.sentences;
};

// Searched treebank
exports.searchTreebank = async (sentences, logicalConditions, n) => {
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
  for (const [index, sentence] of sentences.entries()) {
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
        searchResults.push({ foundNGram: matchesIds, sentenceIndex: index });
      }
    }
  }

  // returns the search results
  return searchResults;
};

// -- AUX FUNCTIONS

// returns the text of a token in the context, as it should be
// displayed in the export .txt and .csv files
function getContextTokenText(token, shownProps) {
  token = token.replace("<sub>", "_");
  token = token.replace("</sub>", "");
  token = token.replace(/<span .*;">/g, "");
  token = token.replace("</span>", "");

  return token;
}

function featsComparison(tokenFeats, featsToCompare) {
  let numberOfMatchs = 0;
  let sensitivityFlag = "";

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
    const compSign = curr["negate"] ? "!==" : "===";

    // getting the searched value
    const searchedVal =
      curr["caseWay"] === "sensitive"
        ? curr["value"]
        : curr["value"].toLowerCase();

    // getting the compared value (the one in the treebank)
    let val = props[curr["prop"]];
    const compVal =
      curr["caseWay"] === "sensitive"
        ? val
        : curr["caseWay"] === "insensitive"
        ? val.toLowerCase()
        : "";

    if (curr["prop"] === "feats") {
      return `${prev} ${op} (${featsComparison(
        compVal,
        searchedVal
      )} ${compSign} true || "${searchedVal}" === "[any]")`;
    } else {
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
