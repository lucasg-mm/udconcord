<template>
  <div>
    I want to look for
    <Dropdown
      class="dropdown"
      style="border-width: 2px; border-radius: 5px; border-color: #e4e5e8"
      v-model="propertyToSearch"
      :options="availableProperties"
      optionLabel="humanReadableName"
      optionValue="propName"
    />
    in a
    <Dropdown
      class="dropdown"
      style="border-width: 2px; border-radius: 5px; border-color: #e4e5e8"
      v-model="caseWay"
      :options="availableCases"
      optionLabel="humanReadableName"
      optionValue="caseName"
    />
    way
    <InputText
      style="
        border-width: 2px;
        border-radius: 5px 0 0 5px;
        border-color: #e4e5e8 white #e4e5e8 #e4e5e8;
        font-family: 'Vidaloka', serif;
        color: black;
      "
      class="search-input"
      type="text"
      v-model="queryString"
    />
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
  emits: ["search-initiated", "search-results-received"],

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
    ]),

    // -- DESCRIPTION:
    // Makes a search in the treebank.
    async search() {
      // tells the parent the search was started. It can
      // now show a progress spinner
      this.$emit("search-initiated");

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/search";

      console.log(">>> definindo corpo da requisição...");
      // defining the request's body
      const requestBody = {
        sentences: this.getConlluData,
        propertyToSearch: this.propertyToSearch,
        valueToSearch: this.queryString,
        caseWay: this.caseWay,
      };

      console.log(">>> fazendo requisição...");
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

      // sets results and searched property on the store
      this.setSearchResults({ searchResults });
      this.setSearchedProperty({ searchedProperty: this.propertyToSearch });

      // sets the indexes of edited sentences in the store
      this.setEditedRowsIndexes({ editedRowsIndexes: [] });

      this.$emit("search-results-received");

      // go to the results route
      this.$router.push("/results");
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep(.dropdown.p-dropdown) {
  .p-dropdown-label,
  .p-dropdown-items {
    font-family: "Vidaloka", serif;
    color: black;
  }
}

.p-button {
  border-width: 2px;
  border-color: #000099;
  background: #000099;
  font-family: "Vidaloka", serif;
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
