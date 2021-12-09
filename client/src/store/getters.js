export default {
  getDoubleClickedSentenceIndexes(state) {
    return state.doubleClickedSentenceIndexes;
  },
  getSearchResults(state) {
    return state.searchResults;
  },
  getEditedRowsIndexes(state) {
    return state.editedRowsIndexes;
  },
  getIsLoading(state) {
    return state.isLoading;
  },
  getLastSearchParams(state) {
    return state.lastSearchParams;
  },
  getMadeChanges(state) {
    return state.madeChanges;
  },
  getUserId(state) {
    return state.userId;
  },
  getUploadProg(state) {
    return state.uploadProg;
  },
};
