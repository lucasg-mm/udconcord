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

  setLastSearchParams(state, { logicalAndConditions, caseWay, shownProps }) {
    state.lastSearchParams = {
      logicalAndConditions,
      caseWay,
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
};
