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
    way.
    <br />
    <br />
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
    <Button
      style="
        border-width: 2px;
        border-color: #000099;
        background: #000099;
        font-family: 'Vidaloka', serif;
        border-radius: 0 5px 5px 0;
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
        caseWay: this.caseWay,
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

<style lang="scss" scoped>
::v-deep(.dropdown.p-dropdown) {
  .p-dropdown-label,
  .p-dropdown-items {
    font-family: "Vidaloka", serif;
    color: black;
  }
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
