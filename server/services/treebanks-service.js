const conlluJsLibrary = require("conllujs");

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
    nGramToSearch.push({});
    logicalConditions.forEach((logicalCondition) => {
      nGramToSearch[i][logicalCondition.propertyToSearch] = {
        value: logicalCondition.queryString[i],
        caseWay: logicalCondition.caseWay,
      };
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
      // checks the n-gram equality of the form
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

function featsComparison(tokenFeats, featsToCompare, caseWay) {
  let numberOfMatchs = 0;
  let sensitivityFlag = "";

  // splits the feats that should be searched
  featsToCompare = featsToCompare.split("|");

  // determines the sensitivity flag (empty if the search should be case sensitive)
  if (caseWay === "insensitive") {
    // case insensitive search
    sensitivityFlag = "i";
  }

  for (let i = 0; i < featsToCompare.length; i++) {
    // mounts the regex
    const re = new RegExp(featsToCompare[i], sensitivityFlag);

    // determines if the feat is present in the analyzed token
    if (re.test(tokenFeats)) {
      numberOfMatchs++;
    }
  }

  // returns true if every feat matched with something
  return featsToCompare.length === numberOfMatchs;
}

// Checks n-gram equality
function nGramEquality(nGram, sequence, start) {
  let numberOfMatches = 0;
  let propertiesToSearch;
  for (let i = 0; i < nGram.length; i++) {
    propertiesToSearch = Object.keys(nGram[i]);
    propertiesToSearch.forEach((propertyToSearch) => {
      const propVal = nGram[i][propertyToSearch].value;
      const caseWay = nGram[i][propertyToSearch].caseWay;

      if (propertyToSearch !== "feats") {
        if (caseWay === "insensitive") {
          if (
            propVal.toLowerCase() === "[any]" ||
            propVal.toLowerCase() ===
              sequence[start + i][propertyToSearch].toLowerCase()
          ) {
            numberOfMatches++;
          }
        } else {
          if (
            propVal.toLowerCase() === "[any]" ||
            propVal === sequence[start + i][propertyToSearch]
          ) {
            numberOfMatches++;
          }
        }
      } else {
        // comparison of 'feats'
        if (
          propVal.toLowerCase() === "[any]" ||
          featsComparison(
            sequence[start + i][propertyToSearch],
            propVal,
            caseWay
          )
        ) {
          numberOfMatches++;
        }
      }
    });
  }

  return propertiesToSearch.length * nGram.length === numberOfMatches;
}

// -- DESCRIPTION:
// Get 'n' ids starting at 'start'.
//
// -- PARAMETERS:
// start: start of the id interval.
// n: interval size
//
// -- RETURNS:
// an array in the closed interval [start, start + 1, ..., start + n - 1]
function getMatchesIds(start, n) {
  const matchesIds = [];

  for (let i = start; i < start + n; i++) {
    matchesIds.push(i);
  }

  return matchesIds;
}
