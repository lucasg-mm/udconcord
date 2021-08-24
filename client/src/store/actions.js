export default {
  setConlluData(context, { conlluData }) {
    context.commit("setConlluData", { conlluData });
  },
  updateConlluDataEl(context, { el, index }) {
    context.commit("updateConlluDataEl", { el, index });
  },
  //----------------------------

  setDoubleClickedSentence(context, { doubleClickedSentence }) {
    context.commit("setDoubleClickedSentence", { doubleClickedSentence });
  },
  //----------------------------

  setSearchResults(context, { searchResults }) {
    context.commit("setSearchResults", { searchResults });
  },
  updateSearchResultsSentence(context, { sentence, index }) {
    context.commit("updateSearchResultsSentence", { sentence, index });
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
};
