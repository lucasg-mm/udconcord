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

  setLastSearchParams(context, { logicalAndConditions, caseWay, shownProps }) {
    context.commit("setLastSearchParams", {
      logicalAndConditions,
      caseWay,
      shownProps,
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
};
