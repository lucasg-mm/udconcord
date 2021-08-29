<template>
  <div class="centered-content" :scrollable="true">
    <p class="heading">Here are your results!</p>
    <p class="description">
      Double-click a sentence to edit its CoNLL-U, or search for another
      property.
    </p>
    <div class="top-set">
      <SearchInput
        @search-results-received="loadLazyData(1, this.recordsPerPage)"
      ></SearchInput>
    </div>

    <div class="number-of-results">~ {{ totalRecords }} results found ~</div>

    <div class="results-set">
      <DataTable
        :lazy="true"
        :paginator="true"
        :rows="recordsPerPage"
        class="tabela"
        style="font-family: 'Vidaloka', serif; white-space: nowrap"
        :value="organizedResults"
        :autoLayout="true"
        :rowHover="true"
        breakpoint="425px"
        :rowClass="rowClass"
        :totalRecords="totalRecords"
        @row-dblclick="editSentence"
        @page="onPage($event)"
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
              v-if="!getEditedRowsIndexes.includes(data.index)"
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
    <div class="bottom-set">
      <Button
        class="export-button"
        label="Export Results"
        @click="exportResults"
      />
    </div>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import SearchInput from "./SearchInput.vue";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  components: {
    SearchInput,
    DataTable,
    Column,
    Button,
  },

  beforeMount() {
    this.loadLazyData(1, this.recordsPerPage);
  },

  activated() {
    // scroll to matchs when the component is reactivated
    this.scrollToMatches();
  },

  computed: {
    /**
     * -- DESCRIPTION:
     * Maps store's getters to this component.
     */
    ...mapGetters([
      "getConlluData",
      "getEditedRowsIndexes",
      "getSearchResults",
      "getSearchedProperty",
    ]),

    // number of results returned by a search
    totalRecords() {
      return this.getSearchResults.length;
    },
  },

  data() {
    return {
      // results after some pre-processing
      organizedResults: [],

      // number os records that should be rendered per page
      recordsPerPage: 100,
    };
  },

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component
     */
    ...mapActions(["setDoubleClickedSentenceIndexes"]),

    /*
    -- DESCRIPTION:
    Handles the page event, emitted by the DataTable.
    It just loads the next batch of data in the next page.
    */
    onPage(event) {
      // gets the page number we're going to
      // (sums 1 because event.page is 0-indexed)
      const pageToGo = event.page + 1;

      // number of rows rendered in pageToGo
      const numberOfRows = event.rows;

      this.loadLazyData(pageToGo, numberOfRows);
    },

    /*
    -- DESCRIPTION:
    Loads a certain amount of data (from the totality of the results)
    in the table.

    -- PARAMETERS:
    pageToGo: table's page in which the table should be rendered.
    numberOfRows: number of rows to be rendered in the table's page.
    */
    loadLazyData(pageToGo, numberOfRows) {
      console.log(">> Loading lazy data...");

      // gets the results array and the string
      // indicating which property is being searched
      const results = this.getSearchResults;
      const searchedProperty = this.getSearchedProperty;

      // gets the data that should be displayed in
      // pageToGo
      const dataInCurrPage = results.slice(
        pageToGo * numberOfRows - numberOfRows,
        pageToGo * numberOfRows
      );

      // formats the data in the DataTable component
      this.organizesResults(dataInCurrPage, searchedProperty, pageToGo);

      // scroll to the matches after updates the DOM
      this.$nextTick(() => this.scrollToMatches());
    },

    // -- DESCRIPTION:
    // Applies the 'edited' class to edited sentences' rows.
    rowClass(data) {
      return this.getEditedRowsIndexes.includes(data.index) ? "edited" : null;
    },

    // -- DESCRIPTION:
    // handles the double click on a sentence, emiting
    // an event and passing the sentence to the parent component.
    editSentence(event) {
      // retrieves the sentence's index to be edited in the conlluData vuex store
      const searchResultsArrayIndex = event.data.index;
      const conlluDataArrayIndex =
        this.getSearchResults[searchResultsArrayIndex].sentenceIndex;

      // sets the double clicked sentence in the global store
      this.setDoubleClickedSentenceIndexes({
        doubleClickedSentenceIndexes: {
          conlluDataIndex: conlluDataArrayIndex,
          searchResultsIndex: searchResultsArrayIndex,
        },
      });

      // go to the results route
      this.$router.push("/edit");
    },

    // -- DESCRIPTION
    // scrolls to the matches found by the search.
    scrollToMatches() {
      // gets the body of the column with the match results
      const matchColumn = document.querySelector(".match-column");
      const container = document.querySelector(".p-datatable-wrapper");
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
    organizesResults(results, searchedProperty, pageToGo = 1) {
      this.organizedResults = [];
      results.forEach((result, index) => {
        console.log(">> organizando resultados...");
        // for each match in this result...

        // gets the matched sentence
        const resultSentence = this.getConlluData[result.sentenceIndex];

        // analyses the searchedProperty and tells whether
        // the property should be displayed in the table cells
        // inside square brackets
        let showAdditionalInfo = searchedProperty === "upostag";

        // gets the left context (string)
        const leftContext = resultSentence.tokens
          .slice(0, result["foundNGram"][0])
          .map((e) => {
            if (showAdditionalInfo) {
              return `${e.form}/${e[this.getSearchedProperty]}`;
            } else {
              return e.form;
            }
          })
          .join(" ");

        // gets the match
        const match = result["foundNGram"]
          .map((tokenId) => {
            if (showAdditionalInfo) {
              return `${resultSentence.tokens[tokenId].form}/${
                resultSentence.tokens[tokenId][this.getSearchedProperty]
              }`;
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
              return `${e.form}/${e[this.getSearchedProperty]}`;
            } else {
              return e.form;
            }
          })
          .join(" ");

        // organizes the data and stores it in an array
        this.organizedResults.push({
          index: index + (pageToGo - 1) * this.recordsPerPage,
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
  },
};
</script>

<style lang="scss" scoped>
.p-button {
  border-color: #2db92d;
  background: #2db92d;
  font-family: "Vidaloka", serif;
  border-radius: 5px;
}

.p-button:hover {
  background: #239023 !important;
  color: #ffffff !important;
  border-color: #239023 !important;
}

.p-button:active {
  background: #47d247 !important;
  color: #ffffff !important;
  border-color: #47d247 !important;
}

.heading {
  font-size: 30px;
  margin-top: 0;
}

.description {
  color: #495057;
  font-size: 16px;
}

.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  width: 80%;
  padding: 50px 50px 70px 50px;
  background-color: #fff;
  border-radius: 5px;
}

.top-set {
  padding-bottom: 50px;
  padding-top: 15px;
  position: relative;
}

.bottom-set {
  margin-top: 30px;
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

.number-of-results {
  color: black;
  padding-bottom: 14px;
  font-size: 14px;
}

.tabela::v-deep .p-datatable-wrapper {
  height: 450px;
  overflow: auto;
  scroll-behavior: smooth;
}

.tabela::v-deep .p-paginator-page {
  font-family: "Vidaloka", serif;
}

.tabela::v-deep .p-paginator-bottom {
  border-width: 0 0 2px 0;
  border-color: #e4e5e8;
}

.tabela::v-deep .edited {
  background-color: #d2f8d2;
}

.tabela::v-deep .p-datatable-tbody tr:hover {
  background-color: #d4ebf2 !important;
  cursor: pointer;
}

.tabela::v-deep .p-datatable-tbody td {
  border-width: 0px;
}
</style>
