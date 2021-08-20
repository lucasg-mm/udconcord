const conlluJsLibrary = require("conllujs");

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
 * conlluObject.sentences: array of objects. Each one represents
 *                         a sentence in the CoNLL-U file.
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
  for (sentence of sentences) {
    // tells if a sentence is already features in the
    // searchResults array
    let sentenceAlreadyFeatured = false;

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

        // if this sentence is already featured in the searchResults array...
        if (sentenceAlreadyFeatured) {
          // pushes the found token's id in the sentence's
          // corresponding entry (which is the last one in the array)
          searchResults[searchResults.length - 1].foundNGramIdGroups.push(
            matchesIds
          );
        } else {
          // if this sentence isn't featured in the searchResults array...

          // creates the sentence's corresponding entry
          // in the array and pushes the found token's id in it
          searchResults.push({ foundNGramIdGroups: [matchesIds], sentence });

          // changes the variable, because now the sentence in featured in
          // searchResults
          sentenceAlreadyFeatured = true;
        }
      }
    }
  }

  // returns the search results
  return searchResults;
};

// -- AUX FUNCTIONS

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
