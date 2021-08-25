export default {
  setConlluData(state, { conlluData }) {
    state.conlluData = conlluData;
  },
  updateConlluDataEl(state, { el, index }) {
    state.conlluData[index] = el;
  },
  //----------------------------

  setDoubleClickedSentence(state, { doubleClickedSentence }) {
    state.doubleClickedSentence = doubleClickedSentence;
  },
  //----------------------------

  setSearchResults(state, { searchResults }) {
    state.searchResults = searchResults;
  },
  updateSearchResultsSentence(state, { sentence, index }) {
    state.searchResults[index].sentence = { ...sentence };
  },
  //----------------------------

  setEditedRowsIndexes(state, { editedRowsIndexes }) {
    state.editedRowsIndexes = editedRowsIndexes;
  },
  pushEditedRowsIndexes(state, { el }) {
    state.editedRowsIndexes.push(el);
  },
  //----------------------------

  setSearchedProperty(state, { searchedProperty }) {
    state.searchedProperty = searchedProperty;
  },
};
