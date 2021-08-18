<template>
  <div>
    <div class="centered-content">
      <p class="heading">Time to search!</p>
      <p class="description">You can use the input fields below.</p>
      <br />
      <ProgressSpinner v-if="isLoading" />
      <i v-else class="fas fa-search search-icon"></i>
      <br />
      <br />
      <br />
      <br />
      <SearchInput
        @search-initiated="showProgressSpinner"
        @search-results-received="forwardResults"
        :conllu-data="conlluData"
      ></SearchInput>
    </div>
  </div>
</template>

<script>
import SearchInput from "./SearchInput.vue";
import ProgressSpinner from "primevue/progressspinner";

export default {
  emits: ["search-results-received"],

  components: {
    SearchInput,
    ProgressSpinner,
  },

  props: {
    conlluData: Object,
  },

  data() {
    return {
      isLoading: false,
    };
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

    // -- DESCRIPTION:
    // shows the progress spinner while loading.
    showProgressSpinner() {
      this.isLoading = true;
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
