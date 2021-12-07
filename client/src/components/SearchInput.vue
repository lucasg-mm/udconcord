<template>
  <div class="input-set">
    <Toast></Toast>
    <ul class="conditions">
      <li
        v-for="(logicalCondition, index) in logicalConditions"
        :key="logicalCondition.id"
      >
        <div class="condition-name" v-if="index !== 0">
          {{ logicalCondition.type.toUpperCase() }}
        </div>
        I
        <Dropdown
          class="dpd negate-dpd"
          v-model="logicalCondition.negate"
          :options="availableNegs"
          optionLabel="humanReadableName"
          optionValue="bool"
        />
        to look for
        <Dropdown
          class="prop-dpd dpd"
          v-model="logicalCondition.propertyToSearch"
          :options="availableProperties"
          optionLabel="humanReadableName"
          optionValue="propName"
        />
        in a
        <Dropdown
          class="case-dpd dpd"
          v-model="logicalCondition.caseWay"
          :options="availableCases"
          optionLabel="humanReadableName"
          optionValue="caseName"
        />
        way:
        <InputText type="text" v-model="logicalCondition.queryString" />
        <Button
          v-bind:class="{
            'logical-btn': index !== 0,
            'logical-btn-first': index === 0,
          }"
          label="AND"
          v-tooltip="'Add logical AND condition below'"
          @click="addLogicalConditionBelow('and', index)"
        />
        <Button
          v-bind:class="{
            'logical-btn': index !== 0,
            'logical-btn-first': index === 0,
          }"
          label="OR"
          v-tooltip="'Add logical OR condition below'"
          @click="addLogicalConditionBelow('or', index)"
        />
        <Button
          v-show="index !== 0"
          class="logical-btn p-button-danger"
          icon="pi pi-times"
          v-tooltip="'Remove logical condition'"
          @click="removeLogicalCondition(index)"
        />
      </li>
    </ul>
    <transition name="fade">
      <div v-if="showOptions" class="visualization-options">
        Show in the results:
        <br class="br-responsive" />
        <span class="option-prop">
          <Checkbox id="prop1" name="prop" value="upos" v-model="shownProps" />
          <label for="prop1"> POS tags</label>
        </span>
        <br class="br-responsive" />
        <span class="option-prop">
          <Checkbox
            id="prop2"
            name="prop"
            value="deprel"
            v-model="shownProps"
          />
          <label for="prop2"> Depedency relations</label>
        </span>
        <br class="br-responsive" />
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
        :label="showOptions ? 'Hide options' : 'Show options'"
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
import Toast from "primevue/toast";

export default {
  props: {
    searchParams: Object,
  },

  components: {
    InputText,
    Button,
    Dropdown,
    Checkbox,
    Toast,
  },

  data() {
    return {
      logicalConditions: [
        {
          negate: false,
          caseWay: "sensitive",
          propertyToSearch: "form",
          queryString: "",
          id: 0,
        },
      ],
      shownProps: [],
      showOptions: false,
      availableCases: [
        { humanReadableName: "case sensitive", caseName: "sensitive" },
        { humanReadableName: "case insensitive", caseName: "insensitive" },
      ],
      availableNegs: [
        { humanReadableName: "don't want", bool: true },
        { humanReadableName: "want", bool: false },
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
    ...mapGetters(["getConlluData", "getUserId"]),
  },

  mounted() {
    if (this.searchParams) {
      this.logicalConditions = this.searchParams.logicalConditions;
      this.shownProps = this.searchParams.logicalConditions;
    }
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
    removeLogicalCondition(index) {
      this.logicalConditions.splice(index, 1);
    },

    // add an AND condition to the array of AND conditions
    addLogicalConditionBelow(type, index) {
      // calculates new id
      const id =
        this.logicalConditions[this.logicalConditions.length - 1].id + 1;

      const cond = {
        negate: false,
        type,
        caseWay: "sensitive",
        propertyToSearch: "form",
        queryString: "",
        id: id,
      };

      // inserts element in the array (at position index+1)
      this.logicalConditions.splice(index + 1, 0, cond);
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
        logicalConditions: this.logicalConditions,
        userId: this.getUserId,
        page: 1,
        rowsNum: 100,
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

      if (response.status === 200) {
        // sets results and searched property on the store

        let results = searchResults["searchResults"];
        this.setSearchResults({ searchResults: results });
        this.setLastSearchParams({
          numResults: searchResults["numResults"],
          logicalConditions: this.logicalConditions,
          shownProps: this.shownProps,
        });

        // sets the indexes of edited sentences in the store
        this.setEditedRowsIndexes({ editedRowsIndexes: [] });

        // go to the results route
        this.$router.push("/results");

        // emit event to indicate received the results
        this.$emit("search-results-received");
      } else {
        // shows message
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: searchResults.message,
          life: 4000,
        });
      }

      this.hideLoadingBar();
    },
  },
};
</script>

<style lang="scss" scoped>
.br-responsive {
  display: none;
}

.condition-name {
  margin-bottom: 25px;
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
  font-size: 1rem;
  display: inline-block;
}

.logical-btn-first.p-button {
  margin-left: 10px;
  width: 103px;
}

.logical-btn.p-button {
  margin-left: 10px;
  width: 65px;
}

.show-options.p-button {
  margin-left: 25px;
}

.dpd {
  text-align: left;
}

.negate-dpd {
  width: 130px;
}

.prop-dpd {
  width: 120px;
}

.case-dpd {
  width: 170px;
}

.p-dropdown {
  vertical-align: bottom;
}

@media (max-width: 500px) {
  .input-set {
    font-size: 0.9rem;
    text-align: left;
  }

  .dpd,
  .p-inputtext,
  .p-button {
    margin-top: 10px;
  }

  .logical-btn.p-button,
  .logical-btn-first.p-button {
    margin-left: 0;
    margin-right: 10px;
  }

  .show-options.p-button {
    margin-left: 0;
  }

  .br-responsive {
    display: inline;
  }

  .option-prop {
    padding-left: 0;
  }
}

@media (min-width: 500px) and (max-width: 1200px) {
  .logical-btn.p-button,
  .logical-btn-first.p-button {
    margin-top: 10px;
  }
}
</style>
