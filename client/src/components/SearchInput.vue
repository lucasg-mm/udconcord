<template>
  <div>
    I want to look for
    <Dropdown
      style="border-radius: 0; border-color: black"
      v-model="propertyToSearch"
      :options="availableProperties"
      optionLabel="humanReadableName"
      optionValue="propName"
    />
    <br />
    <br />
    <InputText
      style="
        border-radius: 0;
        border-color: black white black black;
        font-family: 'Vidaloka', serif;
        color: black;
      "
      class="search-input"
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
  emits: ["search-results-received", "search-initiated"],

  components: {
    InputText,
    Button,
    Dropdown,
  },

  props: {
    conlluData: Object,
  },

  data() {
    return {
      queryString: "",
      propertyToSearch: "form",
      availableProperties: [
        { humanReadableName: "lemmas", propName: "lemma" },
        { humanReadableName: "forms", propName: "form" },
      ],
    };
  },

  methods: {
    // -- DESCRIPTION:
    // Makes a search in the treebank (just word, for now).
    async search() {
      // tells the parent the search was started. It can
      // now show a progress spinner
      this.$emit("search-initiated");

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
@media screen and (max-width: 768px) {
  .search-input {
    width: 135px;
  }
}

@media screen and (max-width: 480px) {
  .search-input {
    width: 100px;
  }
}
</style>
