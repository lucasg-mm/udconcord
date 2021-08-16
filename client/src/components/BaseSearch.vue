<template>
  <div class="centered-content">
    <p class="heading">Time to search!</p>
    <p class="description">You can use the input fields below.</p>
    <br />
    <i class="fas fa-search search-icon"></i>
    <br />
    <br />
    <br />
    <br />
    <SearchInput
      @search-results-received="forwardResults"
      :conllu-data="conlluData"
    ></SearchInput>
  </div>
</template>

<script>
import SearchInput from "./SearchInput.vue";

export default {
  emits: ["search-results-received"],

  components: {
    SearchInput,
  },

  props: {
    conlluData: Object,
  },

  methods: {
    // -- DESCRIPTION:
    // just forwards the 'search-results-received' to the parent component.
    forwardResults(event) {
      // emits event to tell the parent component that the search
      // results were received, and sends these results
      this.$emit("search-results-received", {
        searchResults: event.searchResults,
      });
    },
  },
};
</script>

<style scoped>
.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  background-color: white;
  padding: 35px 25px 35px 25px;
  min-width: 250px;
}

.heading {
  font-size: 30px;
  margin-top: 0;
}

.description {
  color: #495057;
  font-size: 16px;
}

.search-icon {
  font-size: 86px;
}
</style>
