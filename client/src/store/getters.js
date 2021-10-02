export default {
  getConlluData(state) {
    return state.conlluData;
  },
  getDoubleClickedSentenceIndexes(state) {
    return state.doubleClickedSentenceIndexes;
  },
  getSearchResults(state) {
    return state.searchResults;
  },
  getEditedRowsIndexes(state) {
    return state.editedRowsIndexes;
  },
  getSearchedProperty(state) {
    return state.searchedProperty;
  },
  getIsLoading(state) {
    return state.isLoading;
  },
  getLastSearchParams(state) {
    return state.lastSearchParams;
  },
};
