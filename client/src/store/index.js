import { createStore } from "vuex";
import rootMutations from "./mutations.js";
import rootGetters from "./getters.js";
import rootActions from "./actions.js";

// create store
const store = createStore({
  state() {
    return {
      // holds the data of the uploaded conllu file in the form
      // of an object
      conlluData: null,

      // holds data of a double clicked sentence in the results screen
      doubleClickedSentence: null,

      // holds the results of a search made by the user
      searchResults: [],

      // the edited rows (indicated by their indexes) of the results table
      editedRowsIndexes: [],

      // the property being searched
      searchedProperty: "",
    };
  },
  mutations: rootMutations,
  actions: rootActions,
  getters: rootGetters,
});

export default store;
