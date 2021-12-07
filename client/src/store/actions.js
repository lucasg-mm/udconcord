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

  setLastSearchParams(context, { logicalConditions, shownProps, numResults }) {
    context.commit("setLastSearchParams", {
      logicalConditions,
      shownProps,
      numResults,
    });
  },

  //-----------------------------
  setMadeChanges(context, { changesBool }) {
    context.commit("setMadeChanges", { changesBool });
  },

  //-----------------------------
  showLoadingBar(context) {
    context.commit("showLoadingBar");
  },

  hideLoadingBar(context) {
    context.commit("hideLoadingBar");
  },

  // ----------------------------------

  setUserId(context, { userId }) {
    context.commit("setUserId", {
      userId,
    });
  },

  // ----------------------------------

  // resets everything
  resetsEverything(context) {
    context.commit("resetsEverything");
  },
};
