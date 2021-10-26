export default {
  setConlluData(state, { conlluData }) {
    state.conlluData = conlluData;
  },
  updateConlluDataEl(state, { el, index }) {
    state.conlluData[index] = { ...el };
  },
  //----------------------------

  setDoubleClickedSentenceIndexes(state, { doubleClickedSentenceIndexes }) {
    state.doubleClickedSentenceIndexes = doubleClickedSentenceIndexes;
  },
  //----------------------------

  setSearchResults(state, { searchResults }) {
    state.searchResults = searchResults;
  },
  //----------------------------

  setEditedRowsIndexes(state, { editedRowsIndexes }) {
    state.editedRowsIndexes = editedRowsIndexes;
  },
  pushEditedRowsIndexes(state, { el }) {
    state.editedRowsIndexes.push(el);
  },
  //----------------------------

  setLastSearchParams(state, { logicalConditions, shownProps }) {
    state.lastSearchParams = {
      logicalConditions,
      shownProps,
    };
  },

  //-----------------------------

  setMadeChanges(state, { changesBool }) {
    state.madeChanges = changesBool;
  },

  //-----------------------------

  showLoadingBar(state) {
    state.isLoading = true;
  },

  hideLoadingBar(state) {
    state.isLoading = false;
  },

  // resets everything to the initial state
  resetsEverything(state) {
    state.conlluData = null;
    state.doubleClickedSentenceIndexes = {};
    state.searchResults = [];
    state.editedRowsIndexes = [];
    state.lastSearchParams = {};
    state.isLoading = false;
    state.madeChanges = false;
  },
};
