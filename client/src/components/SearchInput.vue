<template>
  <div class="input-set">
    I want to look for
    <Dropdown
      class="dropdown"
      v-model="propertyToSearch"
      :options="availableProperties"
      optionLabel="humanReadableName"
      optionValue="propName"
    />
    in a
    <Dropdown
      class="dropdown"
      v-model="caseWay"
      :options="availableCases"
      optionLabel="humanReadableName"
      optionValue="caseName"
    />
    way:
    <InputText class="search-input" type="text" v-model="queryString" />
    <Button label="Search" @click="search" />
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  emits: ["search-results-received"],

  components: {
    InputText,
    Button,
    Dropdown,
  },

  data() {
    return {
      queryString: "",
      propertyToSearch: "form",
      caseWay: "sensitive",
      availableCases: [
        { humanReadableName: "case sensitive", caseName: "sensitive" },
        { humanReadableName: "case insensitive", caseName: "insensitive" },
      ],
      availableProperties: [
        { humanReadableName: "lemmas", propName: "lemma" },
        { humanReadableName: "forms", propName: "form" },
        { humanReadableName: "POS tags", propName: "upostag" },
        { humanReadableName: "dep. relations", propName: "deprel" },
        { humanReadableName: "feats", propName: "feats" },
      ],
    };
  },

  computed: {
    /**
     * -- DESCRIPTION:
     * Maps store's getters to this component.
     */
    ...mapGetters(["getConlluData"]),
  },

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component.
     */
    ...mapActions([
      "setSearchResults",
      "setSearchedProperty",
      "setEditedRowsIndexes",
      "showLoadingBar",
      "hideLoadingBar",
    ]),

    // -- DESCRIPTION:
    // Makes a search in the treebank.
    async search() {
      this.showLoadingBar();

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/search";

      console.log(">>> definindo corpo da requisição...");
      // defining the request's body
      let requestBody = {
        sentences: this.getConlluData,
        propertyToSearch: this.propertyToSearch,
        valueToSearch: this.queryString,
        caseWay: this.caseWay,
      };

      requestBody = JSON.stringify(requestBody);

      console.log(">>> fazendo requisição...");
      // makes the request
      const response = await fetch(treebanksSearchRouteUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      // parses results to javascript object
      const searchResults = await response.json();

      console.log("searchResults", searchResults);

      // sets results and searched property on the store
      this.setSearchResults({ searchResults });
      this.setSearchedProperty({ searchedProperty: this.propertyToSearch });

      // sets the indexes of edited sentences in the store
      this.setEditedRowsIndexes({ editedRowsIndexes: [] });

      this.$emit("search-results-received");

      // go to the results route
      this.$router.push("/results");
      this.hideLoadingBar();
    },
  },
};
</script>

<style lang="scss" scoped>
.input-set {
  font-family: "Roboto", sans-serif;
  font-size: 18px;
}

.p-inputtext {
  padding: 10px 32px 10px 10px;
  font-size: 18px;
  margin-top: 10px;
  border-width: 2px;
  border-radius: 5px 0 0 5px;
  border-color: #e4e5e8 white #e4e5e8 #e4e5e8;
  font-family: "Roboto", sans-serif;
  color: black;
}

.p-dropdown::v-deep .p-dropdown-label,
.p-dropdown-item {
  padding: 10px 32px 10px 10px;
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  color: black;
}

.p-dropdown {
  border-width: 2px;
  border-radius: 5px;
  border-color: #e4e5e8;
}

.p-button {
  padding: 10px 32px;
  font-size: 18px;
  border-width: 2px;
  border-color: #000099;
  background: #000099;
  font-family: "Roboto", sans-serif;
  border-radius: 0 5px 5px 0;
}

.p-button:hover {
  background: #000066 !important;
  color: #ffffff !important;
  border-color: #000066 !important;
}

.p-button:active {
  background: #0000e6 !important;
  color: #ffffff !important;
  border-color: #0000e6 !important;
}

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
