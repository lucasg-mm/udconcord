<template>
  <div class="input-set">
    I want to look for
    <Dropdown
      v-model="propertyToSearch"
      :options="availableProperties"
      optionLabel="humanReadableName"
      optionValue="propName"
    />
    in a
    <Dropdown
      v-model="caseWay"
      :options="availableCases"
      optionLabel="humanReadableName"
      optionValue="caseName"
    />
    way:
    <InputText class="search-input" type="text" v-model="queryString" />
    <Button class="search-btn" label="Search" @click="search" />
    <Button
      @click="showOptions = !showOptions"
      icon="pi pi-cog"
      class="options-btn p-button-rounded"
    />
    <transition name="fade">
      <div v-if="showOptions" class="visualization-options">
        Show in the results:
        <span class="option-prop">
          <Checkbox id="prop1" name="prop" value="upos" v-model="shownProps" />
          <label for="prop1"> POS tags</label>
        </span>
        <span class="option-prop">
          <Checkbox
            id="prop2"
            name="prop"
            value="deprel"
            v-model="shownProps"
          />
          <label for="prop2"> Depedency relations</label>
        </span>
        <span class="option-prop">
          <Checkbox id="prop3" name="prop" value="feats" v-model="shownProps" />
          <label for="prop3"> Features</label>
        </span>
      </div>
    </transition>
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  emits: ["search-results-received"],

  components: {
    InputText,
    Button,
    Dropdown,
    Checkbox,
  },

  data() {
    return {
      shownProps: [],
      showOptions: false,
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
        { humanReadableName: "pos tags", propName: "upostag" },
        { humanReadableName: "deprels", propName: "deprel" },
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
      "setEditedRowsIndexes",
      "setLastSearchParams",
      "showLoadingBar",
      "hideLoadingBar",
    ]),

    // -- DESCRIPTION:
    // Makes a search in the treebank.
    // TODO: delete this and make this in the parent component
    async search() {
      this.showLoadingBar();

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/search";

      // defining the request's body
      let requestBody = {
        sentences: this.getConlluData,
        propertyToSearch: this.propertyToSearch,
        valueToSearch: this.queryString,
        caseWay: this.caseWay,
      };

      requestBody = JSON.stringify(requestBody);

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

      // sets results and searched property on the store
      this.setSearchResults({ searchResults });
      this.setLastSearchParams({
        searchedProperty: this.propertyToSearch,
        caseWay: this.caseWay,
        searchTerm: this.queryString,
        shownProps: this.shownProps,
      });

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.visualization-options {
  margin-top: 30px;
}

.option-prop {
  padding-left: 20px;
}

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

.p-multiselect {
  padding: 4px 0 4px 4px;
  border-width: 2px;
  border-radius: 5px;
  border-color: #e4e5e8;
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

.options-btn::v-deep {
  margin-left: 25px;
  padding: 21px !important;
}

.search-btn.p-button {
  padding: 10px 32px;
  font-size: 18px;
  border-width: 2px;
  font-family: "Roboto", sans-serif;
  border-radius: 0 5px 5px 0;
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
