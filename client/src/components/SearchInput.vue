<template>
  <div class="input-set">
    <div class="top-row">
      I want to search in a
      <Dropdown
        v-model="caseWay"
        :options="availableCases"
        optionLabel="humanReadableName"
        optionValue="caseName"
        class="case-dropdown"
      />
      way
      <Button
        icon="pi pi-plus"
        class="options-btn p-button-rounded p-button-success p-button-text"
        @click="addLogicalAndCondition"
        v-tooltip="'Add logical AND condition'"
        :disabled="logicalAndConditions.length >= availableProperties.length"
      />
    </div>
    <ul class="conditions">
      <li
        v-for="(logicalAndCondition, index) in logicalAndConditions"
        :key="logicalAndCondition.id"
      >
        <Dropdown
          v-model="logicalAndCondition.propertyToSearch"
          :options="availableProperties"
          optionLabel="humanReadableName"
          optionValue="propName"
          class="prop-dropdown"
        />
        <InputText
          class="search-input"
          type="text"
          v-bind:class="{ 'first-condition': index === 0 }"
          v-model="logicalAndCondition.queryString"
        />
        <Button
          v-show="index !== 0"
          icon="pi pi-times"
          class="options-btn p-button-rounded p-button-danger p-button-text"
          v-tooltip="'Remove logical AND condition'"
          @click="removeLogicalAndCondition(index)"
        />
      </li>
    </ul>
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
    <div class="bottom-row">
      <Button
        icon="pi pi-search"
        class="search-btn"
        label="Search treebank"
        @click="search"
      />
      <Button
        icon="pi pi-cog"
        class="search-btn show-options p-button-outlined"
        label="Show options"
        @click="showOptions = !showOptions"
      />
    </div>
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

    // removes one element from the array of logical and conditions
    removeLogicalAndCondition(index) {
      this.logicalAndConditions.splice(index, 1);
    },

    // add an AND condition to the array of AND conditions
    addLogicalAndCondition() {
      const id = this.logicalAndConditions.at(-1) + 1;
      this.logicalAndConditions.push({
        propertyToSearch: "form",
        queryString: "",
        id: id,
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
.first-condition {
  margin-right: 46px;
}

.conditions {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.conditions li {
  margin-top: 25px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.visualization-options {
  margin-top: 40px;
}

.bottom-row {
  margin-top: 40px;
}

.option-prop {
  padding-left: 20px;
}

.input-set {
  font-family: "Roboto", sans-serif;
  font-size: 18px;
  display: inline-block;
}

.p-inputtext {
  vertical-align: bottom;
  padding: 10px 32px 10px 10px;
  margin-left: 15px;
  font-size: 18px;
  border-radius: 5px;
  font-family: "Roboto", sans-serif;
  color: black;
}

.p-dropdown::v-deep .p-dropdown-label,
.p-dropdown-item {
  padding: 10px 32px 10px 5px;
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  color: black;
}

.p-dropdown {
  vertical-align: middle;
  border-radius: 5px;
}

.p-dropdown.case-dropdown {
  width: 223px;
}

.p-dropdown.prop-dropdown {
  width: 146px;
}

.options-btn::v-deep {
  margin-left: 5px;
  padding: 21px !important;
}

.search-btn.p-button {
  padding: 10px 32px 10px 15px;
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  border-radius: 5px;
}

.show-options.p-button {
  margin-left: 25px;
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
