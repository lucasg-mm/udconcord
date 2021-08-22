<template>
  <div class="centered-content" :scrollable="true">
    <div class="top-set">
      <SearchInput
        @search-results-received="updateResults"
        :conllu-data="conlluData"
      ></SearchInput>
      <Button
        style="
          border-color: green;
          background: green;
          font-family: 'Vidaloka', serif;
          border-radius: 5px;
        "
        class="export-button"
        label="Export Results"
        @click="exportResults"
      />
    </div>

    <div class="number-of-results">~ {{ numberOfResults }} results found ~</div>

    <div class="results-set">
      <DataTable
        class="tabela"
        style="font-family: 'Vidaloka', serif; white-space: nowrap"
        :value="organizedResults"
        :autoLayout="true"
        :rowHover="true"
        @row-dblclick="editSentence"
        breakpoint="425px"
        :rowClass="rowClass"
      >
        <Column
          style="color: black; text-align: right"
          headerStyle="display: none"
          field="leftContext"
          header="Left Context"
        ></Column>
        <Column
          bodyClass="match-column"
          style="color: black; text-align: center"
          headerStyle="display: none"
          field="match"
          header="Match"
          frozen
        >
          <template #body="{ data }">
            <span
              v-if="!editedRowsIndexes.includes(data.index)"
              class="match-highlight"
              style="
                background-color: #6666ff;
                color: white;
                padding: 5px;
                border-radius: 3px;
              "
              >{{ data.match }}</span
            >
            <span v-else>{{ data.match }}</span>
          </template>
        </Column>

        <Column
          style="color: black; text-align: left"
          headerStyle="display: none"
          field="rightContext"
          header="Right Context"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import SearchInput from "./SearchInput.vue";

export default {
  props: {
    searchedProperty: String,
    results: Object,
    conlluData: Object,
    editedRowsIndexes: Array,
  },

  emits: ["sentence-double-click", "search-results-received"],

  components: {
    SearchInput,
    DataTable,
    Column,
    Button,
  },

  beforeMount() {
    this.organizesResults(this.results, this.searchedProperty);
  },

  mounted() {
    // centralizes matches
    this.scrollToMatches();
  },

  computed: {
    // number of results returned by a search
    numberOfResults() {
      return this.organizedResults.length;
    },
  },

  data() {
    return {
      // results after some pre-processing
      organizedResults: [],
    };
  },

  methods: {
    // -- DESCRIPTION:
    // Applies the 'edited' class to edited sentences' rows.
    rowClass(data) {
      // console.log(this.editedRowsIndexes);
      return this.editedRowsIndexes.includes(data.index) ? "edited" : null;
    },

    // -- DESCRIPTION:
    // handles the double click on a sentence, emiting
    // an event and passing the sentence to the parent component.
    editSentence(event) {
      const sentenceObj = JSON.parse(
        JSON.stringify(this.results[event.index].sentence)
      );

      sentenceObj["index"] = event.index;

      this.$emit("sentence-double-click", {
        sentence: sentenceObj,
      });
    },

    // -- DESCRIPTION
    // scrolls to the matches found by the search.
    scrollToMatches() {
      // gets the body of the column with the match results
      const matchColumn = document.querySelector(".match-column");
      const container = document.querySelector(".results-set");
      const matchHighlight = document.querySelector(".match-highlight");

      // scrolls container to centralize it to the matched word
      container.scrollLeft =
        matchHighlight.offsetWidth +
        matchColumn.offsetLeft -
        container.offsetWidth / 2;
    },

    // -- DESCRIPTION
    // this component uses a table to render the results
    // the algorithm bellow pre-process the results in order
    // for them to be usable in the table.
    organizesResults(results, searchedProperty) {
      this.organizedResults = [];
      results.forEach((result, index) => {
        // for each match in this result...

        // gets the matched sentence
        const resultSentence = result["sentence"];

        // analyses the searchedProperty and tells whether
        // the property should be displayed in the table cells
        // inside square brackets
        let showAdditionalInfo = searchedProperty === "upostag";

        // gets the left context (string)
        const leftContext = resultSentence.tokens
          .slice(0, result["foundNGram"][0])
          .map((e) => {
            if (showAdditionalInfo) {
              return `${e.form} [${e[this.searchedProperty]}]`;
            } else {
              return e.form;
            }
          })
          .join(" ");

        // gets the match
        const match = result["foundNGram"]
          .map((tokenId) => {
            if (showAdditionalInfo) {
              return `${resultSentence.tokens[tokenId].form} [${
                resultSentence.tokens[tokenId][this.searchedProperty]
              }]`;
            } else {
              return resultSentence.tokens[tokenId].form;
            }
          })
          .join(" ");

        // gets the right context (string)
        const rightContext = resultSentence.tokens
          .slice(
            result["foundNGram"][result["foundNGram"].length - 1] + 1,
            resultSentence.tokens.length
          )
          .map((e) => {
            if (showAdditionalInfo) {
              return `${e.form} [${e[this.searchedProperty]}]`;
            } else {
              return e.form;
            }
          })
          .join(" ");

        // organizes the data and stores it in an array
        this.organizedResults.push({
          index,
          leftContext,
          match,
          rightContext,
        });
      });
    },

    // -- DESCRIPTION:
    // gets the string representation for the results. That's for making
    // the user be able to download it as a .txt file.
    //
    // -- RETURNS:
    // a String, which is the string representation.
    getResultsStringRepresentation() {
      let finalString = "Left Context,Match,Right Context\n";

      this.organizedResults.forEach((result) => {
        finalString += `"${result.leftContext}","${result.match}","${result.rightContext}"\n`;
      });

      return finalString;
    },

    // -- DESCRIPTION:
    // exports the results in a .txt file
    exportResults() {
      // gets the string representation of the results
      const resultsStringRepresentation = this.getResultsStringRepresentation();

      // exports it to the user
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," +
          encodeURIComponent(resultsStringRepresentation)
      );
      element.setAttribute("download", "search-results.csv");

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },

    updateResults(event) {
      // forwards event to change the results prop in the parent
      this.$emit("search-results-received", {
        searchResults: event.searchResults,
        searchedProperty: event.searchedProperty,
      });

      // organizes the results
      this.organizesResults(event.searchResults, event.searchedProperty);

      // scroll to the matches after updates the DOM
      this.$nextTick(() => this.scrollToMatches());
    },
  },
};
</script>

<style lang="scss" scoped>
.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  width: 80%;
  padding: 50px;
  background-color: #fff;
  border-radius: 5px;
}

.top-set {
  padding-bottom: 50px;
  position: relative;
}

.export-button {
  position: absolute;
  right: 0;
  top: 0;
}

@media screen and (max-width: 768px) {
  .export-button {
    position: static;
  }
}

.results-set {
  height: 450px;
  overflow: auto;
  scroll-behavior: smooth;
}

.number-of-results {
  color: #000099;
  padding-bottom: 15px;
}

.tabela::v-deep .edited {
  background-color: #d2f8d2;
}

.tabela::v-deep .p-datatable-tbody tr:hover {
  background-color: #d4ebf2 !important;
}

.tabela::v-deep .p-datatable-tbody td {
  border-width: 0px;
}
</style>
