<template>
  <div class="main-view">
    <TheNavbar></TheNavbar>
    <component
      @conllu-data-received="handleConlluDataReceived"
      @search-results-received="handleSearchResultsReceived"
      @sentence-double-click="handleSentenceDoubleClick"
      @edited-sentence="handleSentenceEdit"
      @to-results="handleToResults"
      class="showed-content"
      :is="showedComponent"
      v-bind="currentProperties"
    ></component>
  </div>
</template>

<script>
import TheNavbar from "./components/TheNavbar.vue";
import BaseUpload from "./components/BaseUpload.vue";
import BaseSearch from "./components/BaseSearch.vue";
import BaseResults from "./components/BaseResults.vue";
import BaseEdit from "./components/BaseEdit.vue";

export default {
  name: "App",
  components: {
    TheNavbar,
    BaseUpload,
    BaseSearch,
    BaseResults,
    BaseEdit,
  },
  computed: {
    // props for the dynamic component
    currentProperties() {
      // Props for BaseSearch component
      if (this.showedComponent === "BaseSearch") {
        return { "conllu-data": this.conlluData };
      } else if (this.showedComponent === "BaseResults") {
        return {
          results: this.searchResults,
          "conllu-data": this.conlluData,
          "edited-rows-indexes": this.editedRowsIndexes,
          "searched-property": this.searchedProperty,
        };
      } else if (this.showedComponent === "BaseEdit") {
        return { sentence: this.doubleClickedSentence };
      } else {
        return {};
      }
    },
  },
  data() {
    return {
      // holds the data of the uploaded conllu file in the form
      // of an object
      conlluData: null,

      // holds data of a double clicked sentence in the results screen
      doubleClickedSentence: null,

      // holds the results of a search made by the user
      searchResults: [],

      // component being rendered at the moment
      showedComponent: "BaseUpload",

      // the edited rows (indicated by their indexes) of the results table
      editedRowsIndexes: [],

      // the property being searched
      searchedProperty: "",
    };
  },
  methods: {
    /*
    -- DESCRIPTION:
    Shows the results screen.
    */
    handleToResults() {
      // updates the shown component to the results one
      this.showedComponent = "BaseResults";
    },

    /*
    -- DESCRIPTION:
    Replaces a sentence inside the conlluData array with its
    updated version.
    */
    handleSentenceEdit(event) {
      // gets updated version from event
      const updatedSentence = event.sentence;

      // gets the gets the index from the sentence to be updated
      // (in the results array)
      const updatedSentenceIndexResults = event.index;

      // gets the index from the sentence to be updated
      // (in the global conlluData array)
      const updatedSentenceIndex = this.conlluData.findIndex(
        (sentence) =>
          sentence.metadata.sent_id === updatedSentence.metadata.sent_id
      );

      // updates the sentence in the results array
      this.searchResults[updatedSentenceIndexResults].sentence =
        updatedSentence;

      // updates the sentence in the global conllu array
      this.conlluData[updatedSentenceIndex] = updatedSentence;

      // updates the ids of edited sentences
      this.editedRowsIndexes.push(event.index);
    },

    // -- DESCRIPTION:
    // Handles the receiving of the conllu data from
    // the a double clicked sentence
    //
    // -- PARAMETERS:
    // event: event emited by the BaseResults component
    handleSentenceDoubleClick(event) {
      this.doubleClickedSentence = event.sentence;
      this.showedComponent = "BaseEdit";
    },

    // -- DESCRIPTION:
    // Handles the receiving of the conllu data from
    // the uploaded file
    //
    // -- PARAMETERS:
    // event: event emited by the BaseUpload component
    handleConlluDataReceived(event) {
      // updates the conllu data
      this.conlluData = event.conlluData;

      // updates the shown component to the search one
      this.showedComponent = "BaseSearch";
    },

    // -- DESCRIPTION:
    // Handles the receiving of search results
    //
    // -- PARAMETERS:
    // event: event emited by the BaseSearch component
    handleSearchResultsReceived(event) {
      // updates the searched property
      this.searchedProperty = event.searchedProperty;

      // updates the search results
      this.searchResults = event.searchResults;

      // updates the shown component to the results one
      this.showedComponent = "BaseResults";

      // empties the edited sentences array
      this.editedRowsIndexes = [];
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Vidaloka&display=swap");

html,
body,
#app,
.main-view {
  min-height: 100%;
  min-width: 100%;
  margin: 0;
  background-color: #ccdde8;
}

body {
  padding-bottom: 70px;
}

.showed-content {
  width: 40%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 80px;
}

TheFooter {
  margin-top: 100px;
}
</style>
