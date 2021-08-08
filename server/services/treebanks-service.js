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
 * propertyToSearch: the property to be searched (TODO...);
 * valueToSearch: FORM's (for now) value to be searched.
 *
 * -- RETURNS:
 * conlluObject.sentences: array of objects. Each one represents
 *                         a sentence in the CoNLL-U file.
 */
exports.searchTreebank = async (sentences, propertyToSearch, valueToSearch) => {
  // OBS.: we're just doing forms for now!

  // variable to store search results
  const searchResults = [];

  // iterates through the sentences array
  for (sentence of sentences) {
    // tells if a sentence is already features in the
    // searchResults array
    let sentenceAlreadyFeatured = false;

    // iterates through the tokens of a sentence
    for (token of sentence["tokens"]) {
      // if the token's form is the same as the searched one, put the sentence
      // and the token's id in the searchResults array
      if (token["form"] === valueToSearch) {
        // if this sentence is already featured in the searchResults array...
        if (sentenceAlreadyFeatured) {
          // pushes the found token's id in the sentence's
          // corresponding entry (which is the last one in the array)
          searchResults[searchResults.length - 1].foundTokensIds.push(token.id);
        } else {
          // if this sentence isn't featured in the searchResults array...

          // creates the sentence's corresponding entry
          // in the array and pushes the found token's id in it
          searchResults.push({ foundTokensIds: [token.id], sentence });

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
