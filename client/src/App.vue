<template>
  <div class="main-view">
    <TheNavbar></TheNavbar>
    <component
      @conllu-data-received="handleConlluDataReceived"
      @search-results-received="handleSearchResultsReceived"
      @sentence-double-click="handleSentenceDoubleClick"
      @to-results="handleToResults"
      class="showed-content"
      :is="showedComponent"
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
  data() {
    return {
      // component being rendered at the moment
      showedComponent: "BaseUpload",
    };
  },
  methods: {
    /*
    -- DESCRIPTION:
    Changes the showed component to BaseResults.
    */
    handleToResults() {
      // updates the shown component to the results one
      this.showedComponent = "BaseResults";
    },

    // -- DESCRIPTION:
    // Changes the showed component to BaseEdit.
    handleSentenceDoubleClick() {
      this.showedComponent = "BaseEdit";
    },

    // -- DESCRIPTION:
    // Changes the showed component to BaseSearch.
    handleConlluDataReceived() {
      // updates the shown component to the search one
      this.showedComponent = "BaseSearch";
    },

    // -- DESCRIPTION:
    // Changes showed component to BaseResults.
    handleSearchResultsReceived() {
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
