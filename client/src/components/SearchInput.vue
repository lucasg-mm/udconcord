<template>
  <div class="input-set">
    I want to search in a
    <Dropdown
      v-model="caseWay"
      :options="availableCases"
      optionLabel="humanReadableName"
      optionValue="caseName"
    />
    way
    <Button
      @click="addLogicalAndCondition"
      icon="pi pi-plus"
      class="options-btn p-button-rounded"
    />
    <Button
      @click="showOptions = !showOptions"
      icon="pi pi-cog"
      class="options-btn p-button-rounded"
    />
    <br />
    <br />
    <ul>
      <li
        v-for="logicalAndCondition in logicalAndConditions"
        :key="logicalAndCondition.id"
      >
        <Dropdown
          v-model="logicalAndCondition.propertyToSearch"
          :options="availableProperties"
          optionLabel="humanReadableName"
          optionValue="propName"
        />
        <InputText
          class="search-input"
          type="text"
          v-model="logicalAndCondition.queryString"
        />
      </li>
    </ul>
    <br />
    <br />
    <Button class="search-btn" label="Search" @click="search" />
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
      logicalAndConditions: [
        {
          propertyToSearch: "form",
          queryString: "",
          id: 0,
        },
      ],
      shownProps: [],
      showOptions: false,
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

    // add an AND condition to the array of AND conditions
    addLogicalAndCondition() {
      this.logicalAndConditions.push({
        propertyToSearch: "form",
        queryString: "",
      });
    },

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
        logicalAndConditions: this.logicalAndConditions,
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
  // vertical-align: bottom;
  padding: 10px 32px 10px 10px;
  font-size: 18px;
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
  vertical-align: bottom;
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
