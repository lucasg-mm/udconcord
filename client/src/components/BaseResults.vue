<template>
  <div class="centered-content" :scrollable="true">
    <!-- <h1 class="heading">Here are your results!</h1>
    <p class="description">
      Double-click a sentence to edit its CoNLL-U, or search for another
      property.
    </p> -->
    <div class="top-set">
      <SearchInput
        @search-results-received="loadLazyData(1, this.recordsPerPage)"
      ></SearchInput>
    </div>

    <div class="results-set">
      <DataTable
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
        :lazy="true"
        :paginator="true"
        :rows="recordsPerPage"
        class="tabela"
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
        >
          <template #body="{ data }">
            <span v-html="data.leftContext"></span>
          </template>
        </Column>
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
              v-html="data.match"
            ></span>
            <span v-else>{{ data.match }}</span>
          </template>
        </Column>

        <Column
          style="color: black; text-align: left"
          headerStyle="display: none"
          field="rightContext"
          header="Right Context"
        >
          <template #body="{ data }">
            <span v-html="data.rightContext"></span>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class="bottom-set">
      <SplitButton
        class="export-button"
        @click="exportTreebank"
        label="Export"
        :model="exportButtonItems"
      ></SplitButton>
    </div>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import SplitButton from "primevue/splitbutton";
import SearchInput from "./SearchInput.vue";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  components: {
    SearchInput,
    DataTable,
    Column,
    SplitButton,
  },

  beforeMount() {
    this.loadLazyData(1, this.recordsPerPage);
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.path === "/edit") {
        // scroll to matches column
        vm.restoreScrollState();
      }
    });
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
      // stores the previous route
      previousRoute: "",

      // results after some pre-processing
      organizedResults: [],

      // number os records that should be rendered per page
      recordsPerPage: 100,

      // stores the scroll state of the results' container
      scrollState: {},

      // items in the export button items (it's a split button)
      exportButtonItems: [
        {
          label: "Export treebank (.conllu)",
          command: () => {
            this.exportTreebank();
          },
        },
        {
          label: "Export search results (.csv)",
          command: () => {
            this.exportSearchResults("csv");
          },
        },
        {
          label: "Export search results (.txt)",
          command: () => {
            this.exportSearchResults("txt");
          },
        },
      ],
    };
  },

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component
     */
    ...mapActions([
      "setDoubleClickedSentenceIndexes",
      "showLoadingBar",
      "hideLoadingBar",
    ]),

    async exportTreebank() {
      // shows loading bar
      this.showLoadingBar();

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/parse";

      // defining the request's body
      let requestBody = {
        sentences: this.getConlluData,
      };

      requestBody = JSON.stringify(requestBody);

      // makes the request
      const response = await fetch(treebanksSearchRouteUrl, {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      const conlluText = await response.text();
      this.exportFile(conlluText, "edited-treebank.conllu");
      // shows loading bar
      this.hideLoadingBar();
    },

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
      const container = document.querySelector(".p-datatable-wrapper");
      this.saveScrollState(container);

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
    // Restores the scroll position of the results table defined before
    // the user left the /results component.
    restoreScrollState() {
      const container = document.querySelector(".p-datatable-wrapper");
      container.scrollTop = this.scrollState.scrollTop;
      const checkIfScrollIsFinished = setInterval(() => {
        if (container.scrollTop === this.scrollState.scrollTop) {
          container.scrollLeft = this.scrollState.scrollLeft;
          clearInterval(checkIfScrollIsFinished);
        }
      }, 20);
    },

    /*
     * -- DESCRIPTION
     * Saves the scroll position of the container containing the conllu editor.
     */
    saveScrollState(el) {
      this.scrollState = {
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
    },

    async exportSearchResults(fileExtension) {
      console.log(fileExtension);

      this.showLoadingBar();
      // gets the results array and the string
      // indicating which property is being searched
      // organizes all the results at once
      const results = this.getSearchResults;
      const searchedProperty = this.getSearchedProperty;
      this.organizesResults(results, searchedProperty);

      // gets the backend export results route URL
      const exportResultsRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/export-results";

      const requestBody = JSON.stringify({
        organizedResults: this.organizedResults,
        fileExtension,
      });

      // makes the request
      const response = await fetch(exportResultsRouteUrl, {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      const resultsText = await response.text();
      this.exportFile(resultsText, `search-results.${fileExtension}`);

      this.hideLoadingBar();
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

        // different info should be displayed
        // depending on the searchedProperty
        const showUposTagInfo = searchedProperty === "upostag";

        const showDeprelInfo = searchedProperty === "deprel";

        const showFeatsInfo = searchedProperty === "feats";

        // stores heads
        const heads = [];
        // gets the match
        const match = result["foundNGram"]
          .map((tokenId) => {
            if (showUposTagInfo || showFeatsInfo) {
              return `${resultSentence.tokens[tokenId].form}/${
                resultSentence.tokens[tokenId][this.getSearchedProperty]
              }`;
            } else if (showDeprelInfo) {
              // stores match's head
              heads.push(resultSentence.tokens[tokenId].head);

              return `${resultSentence.tokens[tokenId].form}<sub>${
                resultSentence.tokens[tokenId].id
              }</sub>/${
                resultSentence.tokens[tokenId][this.getSearchedProperty]
              }/${resultSentence.tokens[tokenId].head}`;
            } else {
              return resultSentence.tokens[tokenId].form;
            }
          })
          .join("\xa0\xa0\xa0");

        // gets the left context (string)
        const leftContext = resultSentence.tokens
          .slice(0, result["foundNGram"][0])
          .map((e) => {
            if (showUposTagInfo || showFeatsInfo) {
              return `${e.form}/${e[this.getSearchedProperty]}`;
            } else if (showDeprelInfo) {
              if (heads.includes(e.id.toString())) {
                return `<span style="background-color: #46a8f5; color: white;padding: 5px; border-radius: 3px;">${
                  e.form
                }<sub>${e.id}</sub>/${e[this.getSearchedProperty]}</span>`;
                // return `${e.form}<sub>${e.id}</sub>/${
                //   e[this.getSearchedProperty]
                // }`;
              } else {
                return `${e.form}<sub>${e.id}</sub>/${
                  e[this.getSearchedProperty]
                }`;
              }
            } else {
              return e.form;
            }
          })
          .join("\xa0\xa0\xa0");

        // gets the right context (string)
        const rightContext = resultSentence.tokens
          .slice(
            result["foundNGram"][result["foundNGram"].length - 1] + 1,
            resultSentence.tokens.length
          )
          .map((e) => {
            if (showUposTagInfo || showFeatsInfo) {
              return `${e.form}/${e[this.getSearchedProperty]}`;
            } else if (showDeprelInfo) {
              if (heads.includes(e.id.toString())) {
                return `<span style="
                background-color: #46a8f5;
                color: white;
                padding: 5px;
                border-radius: 3px;
              ">${e.form}<sub>${e.id}</sub>/${
                  e[this.getSearchedProperty]
                }</span>`;
              } else {
                return `${e.form}<sub>${e.id}</sub>/${
                  e[this.getSearchedProperty]
                }`;
              }
            } else {
              return e.form;
            }
          })
          .join("\xa0\xa0\xa0");

        // organizes the data and stores it in an array
        this.organizedResults.push({
          index: index + (pageToGo - 1) * this.recordsPerPage,
          leftContext,
          match,
          rightContext,
        });
        console.log(this.organizedResults);
      });
    },

    // -- DESCRIPTION:
    // exports a text file
    exportFile(text, fileName) {
      // exports it to the user
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
      );
      element.setAttribute("download", fileName);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
  },
};
</script>

<style lang="scss" scoped>
.p-datatable {
  font-family: "Roboto", sans-serif;
  white-space: nowrap;
}

.tabela::v-deep .p-datatable-tbody tr {
  background-color: #eff4f8;
}

.heading {
  font-size: 38px;
  font-weight: 700;
}

.description {
  color: #495057;
  font-size: 18px;
}

.centered-content {
  font-family: "Roboto", sans-serif;
  text-align: center;
  width: 90%;
  padding: 50px 50px 70px 50px;
  background-color: #eff4f8;
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

.export-button::v-deep .p-button {
  padding: 10px 32px 10px 20px;
  font-size: 18px;
}

@media screen and (max-width: 768px) {
  .export-button {
    position: static;
  }
}

.number-of-results {
  color: #495057;
  padding-bottom: 14px;
  font-size: 14px;
}

.tabela::v-deep .p-datatable-wrapper {
  height: 450px;
  overflow: auto;
  scroll-behavior: smooth;
}

.tabela::v-deep .p-paginator-page {
  font-family: "Roboto", sans-serif;
  background-color: #eff4f8;
}

.tabela::v-deep .p-paginator-bottom {
  border-width: 0 0 2px 0;
  border-color: #e4e5e8;
  background-color: #eff4f8;
}

.tabela::v-deep .edited {
  background-color: #d2f8d2 !important;
}

.tabela::v-deep .p-datatable-tbody tr:hover {
  background-color: #d4ebf2 !important;
  cursor: pointer;
}

.tabela::v-deep .p-datatable-tbody td {
  border-width: 0px;
}

::v-deep(.p-paginator) {
  .p-paginator-current {
    margin-left: auto;
  }
}
</style>
