export default {
  setConlluData(context, { conlluData }) {
    context.commit("setConlluData", { conlluData });
  },
  updateConlluDataEl(context, { el, index }) {
    context.commit("updateConlluDataEl", { el, index });
  },
  //----------------------------

  setDoubleClickedSentenceIndexes(context, { doubleClickedSentenceIndexes }) {
    context.commit("setDoubleClickedSentenceIndexes", {
      doubleClickedSentenceIndexes,
    });
  },
  //----------------------------

  setSearchResults(context, { searchResults }) {
    context.commit("setSearchResults", { searchResults });
  },
  //----------------------------

  setEditedRowsIndexes(context, { editedRowsIndexes }) {
    context.commit("setEditedRowsIndexes", { editedRowsIndexes });
  },
  pushEditedRowsIndexes(context, { el }) {
    context.commit("pushEditedRowsIndexes", { el });
  },
  //----------------------------

  setSearchedProperty(context, { searchedProperty }) {
    context.commit("setSearchedProperty", { searchedProperty });
  },

  //----------------------------

  setLastSearchParams(
    context,
    { searchedProperty, caseWay, searchTerm, shownProps }
  ) {
    context.commit("setLastSearchParams", {
      searchedProperty,
      caseWay,
      searchTerm,
      shownProps,
    });
  },

  //-----------------------------
  showLoadingBar(context) {
    context.commit("showLoadingBar");
  },

  hideLoadingBar(context) {
    context.commit("hideLoadingBar");
  },
};
