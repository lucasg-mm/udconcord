export default {
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

  setLastSearchParams(state, { logicalConditions, shownProps, numResults }) {
    state.lastSearchParams = {
      logicalConditions,
      shownProps,
      numResults,
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

  //------------------------------

  setUserId(state, { userId }) {
    state.userId = userId;
  },

  //------------------------------

  // resets everything to the initial state
  resetsEverything(state) {
    state.userId = null;
    state.doubleClickedSentenceIndexes = {};
    state.searchResults = [];
    state.editedRowsIndexes = [];
    state.lastSearchParams = {};
    state.isLoading = false;
    state.madeChanges = false;
  },
};
