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

/**
 * -- DESCRIPTION:
 * Searches for a FORM (for now) in a array of sentences.
 *
 * -- PARAMETERS:
 * sentences: array of UD sentences (must be like the one in the
 *            response of the POST endpoint at /treebanks);
 * propertyToSearch: the property that should be searched: like form or lemma;
 * valueToSearch: FORM's (for now) value to be searched (can be a n-gram);
 * caseWay: indicates if the comparisson will be made in case sensitive or
 *          insensitive way. Can be "sensitive" or "insensitive".
 *
 * -- RETURNS:
 * Array of objects. Each one represents a sentence in the CoNLL-U file.
 * Each object has the form
 * {
 *    foundNGram (the found n-gram in the sentence)
 *    sentenceIndex (the index of the found sentence in the 'sentences' array)
 * }
 */
exports.searchTreebank = async (
  sentences,
  propertyToSearch,
  valueToSearch,
  caseWay
) => {
  // variable to store search results
  const searchResults = [];

  // separate words forming the n-gram
  const nGramToSearch = valueToSearch.split(" ");

  // iterates through the sentences array
  for (const [index, sentence] of sentences.entries()) {
    // iterates through the tokens of a sentence
    for (
      let i = 0;
      i < sentence["tokens"].length - nGramToSearch.length + 1;
      i++
    ) {
      // checks the n-gram equality of the form
      if (
        nGramEquality(
          nGramToSearch,
          sentence["tokens"],
          i,
          propertyToSearch,
          caseWay
        )
      ) {
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

// returns the text of a matched token, as it should be
// displayed in the export .txt and .csv files
function getMatchedTokenText(token, shownProps) {}

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

// -- DESCRIPTION:
// Checks for n-gram equality in a given sequence, in a given start.
//
// -- PARAMETERS:
// nGram: n-gram to be looked in the first n tokens of sequence;
// sequence: sequence of tokens (like a sentence);
// start: index of token in sequence to start the search;
// propertyToSearch: the property that should be searched: like form or lemma.
// caseWay: indicates if the comparisson will be made in case sensitive or
//          insensitive way. Can be "sensitive" or "insensitive".
//
// -- RETURNS:
// a boolean indicating wheter there was a match (true) or no (false).
function nGramEquality(nGram, sequence, start, propertyToSearch, caseWay) {
  let numberOfMatches = 0;
  for (let i = 0; i < nGram.length; i++) {
    if (propertyToSearch !== "feats") {
      if (caseWay === "insensitive") {
        if (
          nGram[i].toLowerCase() ===
          sequence[start + i][propertyToSearch].toLowerCase()
        ) {
          numberOfMatches++;
        }
      } else {
        if (nGram[i] === sequence[start + i][propertyToSearch]) {
          numberOfMatches++;
        }
      }
    } else {
      // comparison of 'feats'
      if (
        featsComparison(
          sequence[start + i][propertyToSearch],
          nGram[i],
          caseWay
        )
      ) {
        numberOfMatches++;
      }
    }
  }

  return nGram.length === numberOfMatches;
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
