<template>
  <div class="main-view">
    <TheNavbar></TheNavbar>
    <component
      @conllu-data-received="handleConlluDataReceived"
      @search-results-received="handleSearchResultsReceived"
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

export default {
  name: "App",
  components: {
    TheNavbar,
    BaseUpload,
    BaseSearch,
    BaseResults,
  },
  computed: {
    // props for the dynamic component
    currentProperties() {
      // Props for BaseSearch component
      if (this.showedComponent === "BaseSearch") {
        return { "conllu-data": this.conlluData };
      } else if (this.showedComponent === "BaseResults") {
        return { results: this.searchResults };
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

      // holds the results of a search made by the user
      searchResults: [],

      // component being rendered at the moment
      showedComponent: "BaseUpload",
    };
  },
  methods: {
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
      // updates the search results
      this.searchResults = event.searchResults;

      // updates the shown component to the results one
      this.showedComponent = "BaseResults";
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
