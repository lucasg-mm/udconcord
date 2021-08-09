<template>
  <div class="centered-content">
    <p class="heading">Now, search for a word!</p>
    <p class="description">You can use the input field below.</p>
    <br />
    <i class="fas fa-search search-icon"></i>
    <br />
    <br />
    <br />
    <InputText
      style="
        width: 220px;
        border-radius: 0;
        border-color: white;
        font-family: 'Vidaloka', serif;
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

export default {
  components: {
    InputText,
    Button,
  },

  emits: ["search-results-received"],

  props: {
    conlluData: Object,
  },

  data() {
    return {
      queryString: "",
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
        propertyToSearch: "TBA",
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
}

.heading {
  font-size: 30px;
}

.description {
  color: #495057;
  font-size: 16px;
}

.search-icon {
  font-size: 86px;
}
</style>
