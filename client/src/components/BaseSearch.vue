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
    I want to look for
    <Dropdown
      style="border-radius: 0; border-color: black"
      v-model="propertyToSearch"
      :options="availableProperties"
    />
    <br />
    <br />
    <InputText
      style="
        min-width: 220px;
        border-radius: 0;
        border-color: black white black black;
        font-family: 'Vidaloka', serif;
        color: black;
      "
      type="text"
      v-model="queryString"
    />
    <Button
      style="
        border-color: #000099;
        background: #000099;
        font-family: 'Vidaloka', serif;
        border-radius: 0;
      "
      label="Search"
      @click="search"
    />
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";

export default {
  components: {
    InputText,
    Button,
    Dropdown,
  },

  emits: ["search-results-received"],

  props: {
    conlluData: Object,
  },

  data() {
    return {
      queryString: "",
      propertyToSearch: "",
      availableProperties: ["lemmas", "forms"],
    };
  },

  methods: {
    // -- DESCRIPTION:
    // Makes a search in the treebank (just word, for now).
    async search() {
      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/search";

      // defining the request's body
      const requestBody = {
        sentences: this.conlluData,
        propertyToSearch: this.propertyToSearch,
        valueToSearch: this.queryString,
      };

      // makes the request
      const response = await fetch(treebanksSearchRouteUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // parses results to javascript object
      const searchResults = await response.json();

      // emits event to tell the parent component that the search
      // results were received, and sends these results
      this.$emit("search-results-received", {
        searchResults,
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
