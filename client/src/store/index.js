import { createStore } from "vuex";
import rootMutations from "./mutations.js";
import rootGetters from "./getters.js";
import rootActions from "./actions.js";

// create store
const store = createStore({
  state() {
    return {
      // holds the user's id (generated with uuid package)
      userId: null,

      // holds the indexes
      // for the double clicked sentence
      doubleClickedSentenceIndexes: {},

      // holds the results of a search made by the user
      searchResults: [],

      // the edited rows (indicated by their indexes) of the results table
      editedRowsIndexes: [],

      // parameters used in the last search
      lastSearchParams: {},

      // tells if the app is loading something (when it is, it shows a progress bar at the
      // top of the page)
      isLoading: false,

      // tells if the user made changes to conllu before exiting the edit page
      madeChanges: false,
    };
  },
  mutations: rootMutations,
  actions: rootActions,
  getters: rootGetters,
});

export default store;
