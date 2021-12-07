<template>
  <div class="centered-content" :scrollable="true">
    <div class="top-set">
      <SearchInput
        :searchParams="getLastSearchParams"
        @search-results-received="resultsReceiver()"
      ></SearchInput>
    </div>

    <div class="results-set">
      <DataTable
        v-if="totalRecords"
        ref="datatable"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
        :lazy="true"
        :paginator="true"
        v-model:rows="initialRowNum"
        class="tabela"
        :value="organizedResults"
        :autoLayout="true"
        :rowHover="true"
        breakpoint="425px"
        :rowClass="rowClass"
        :totalRecords="totalRecords"
        :loading="loading"
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
              class="match-highlight"
              style="
                background-color: #2196f3;
                color: white;
                padding: 5px;
                border-radius: 3px;
              "
              v-html="data.match"
            ></span>
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
    <div v-if="!totalRecords" class="nothing-found">
      Your search did not find any result!
      <br />
      <img class="empty-data-art" src="../assets/nothing-found.svg" />
    </div>
    <div v-if="totalRecords" class="bottom-set">
      <SplitButton
        icon="pi pi-download"
        class="export-button"
        @click="exportTreebank(this.getConlluData)"
        label="Download"
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

  // created() {
  //   if (!this.getConlluData) {
  //     window.location.href = "/";
  //   } else if (!this.getSearchResults) {
  //     window.location.href = "/search";
  //   }
  // },

  beforeRouteLeave(to) {
    if (to.path === "/") {
      // resets keep-alive component
      this.resetsEverything();
    }
  },

  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      if (from.path === "/edit") {
        if (vm.getMadeChanges) {
          vm.setMadeChanges({ changesBool: false });

          // redo search
          await vm.search({
            sentences: vm.getConlluData,
            logicalConditions: vm.getLastSearchParams.logicalConditions,
          });

          // rebuilds table from last page
          vm.resultsReceiver(this.currPage - 1, false);
        }
        // scroll to matches column
        vm.restoreScrollState();
      } else if (from.path === "/search") {
        vm.resultsReceiver();
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
      "getLastSearchParams",
      "getMadeChanges",
      "getUserId",
    ]),

    // number of results returned by a search
    totalRecords() {
      return this.getLastSearchParams.numResults;
    },

    recPerPage() {
      return this.$refs.datatable.d_rows;
    },
  },

  data() {
    return {
      // tells if datatable is loading or not
      loading: false,

      // stores the current datatable page
      currPage: 1,

      // stores the previous route
      previousRoute: "",

      // results after some pre-processing
      organizedResults: [],

      // initial number os records that should be rendered per page
      initialRowNum: 100,

      // stores the scroll state of the results' container
      scrollState: {},

      // items in the export button items (it's a split button)
      exportButtonItems: [
        {
          label: "Download treebank (.conllu)",
          command: () => {
            this.exportTreebank(this.getConlluData);
          },
        },
        {
          label: "Download search results (.conllu)",
          command: () => {
            // downloads every sentence in the results
            // as .conllu
            const sentencesToDownload = new Set();
            this.getSearchResults.forEach((result) => {
              sentencesToDownload.add(this.getConlluData[result.sentenceIndex]);
            });
            this.exportTreebank(Array.from(sentencesToDownload));
          },
        },
        {
          label: "Download search results (.csv)",
          command: () => {
            this.exportSearchResults("csv");
          },
        },
        {
          label: "Download search results (.txt)",
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
      "setSearchResults",
      "setMadeChanges",
      "setDoubleClickedSentenceIndexes",
      "showLoadingBar",
      "hideLoadingBar",
      "resetsEverything",
    ]),
    // searches in the treebank
    async search(requestBody) {
      this.showLoadingBar();

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/search";

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

      this.hideLoadingBar();
    },

    // this is supposed to be called right after making a search
    // (first 100 results)
    resultsReceiver(page = 0, scroll = true) {
      // process results if there are any
      this.$nextTick(() => {
        if (this.totalRecords) {
          this.loadLazyData(this.getSearchResults, scroll);
          this.goToPage(page);
        }
      });
    },

    async exportTreebank(conlluData) {
      // shows loading bar
      this.showLoadingBar();

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/parse";

      // defining the request's body
      let requestBody = {
        sentences: conlluData,
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

    // programatically goes to a certain page
    goToPage(page) {
      this.$refs.datatable.d_first = page * this.recPerPage;
    },

    // get data from search
    // more specifically, in a certain page
    async getDataFromPage(page = 1) {
      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/search";

      // defining the request's body
      let requestBody = {
        logicalConditions: this.getLastSearchParams.logicalConditions,
        userId: this.getUserId,
        page,
        rowsNum: this.initialRowNum,
      };

      requestBody = JSON.stringify(requestBody);

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
      let results = searchResults["searchResults"];

      this.setSearchResults({ searchResults: results });

      return results;
    },

    // Handles the page event, emitted by the DataTable.
    // It just loads the next batch of data in the next page.
    async onPage(event) {
      // gets the page number we're going to
      // (sums 1 because event.page is 0-indexed)
      const pageToGo = event.page + 1;

      this.currPage = pageToGo;

      this.loading = true;
      const data = await this.getDataFromPage(pageToGo);

      this.loadLazyData(data);
      this.loading = false;
    },

    // formats data
    // centralizes matches
    loadLazyData(results, scroll = true) {
      // formats the data in the DataTable component
      this.organizesResults(results);

      // scroll to the matches after updates the DOM
      if (scroll) {
        this.$nextTick(() => this.scrollToMatches());
      }
    },

    // handles the double click on a sentence, emiting
    // an event and passing the sentence to the parent component.
    editSentence(event) {
      const container = document.querySelector(".p-datatable-wrapper");
      this.saveScrollState(container);

      // retrieves the sentence's index to be edited in the conlluData vuex store
      const searchResultsArrayIndex = event.index;

      // sets the double clicked sentence in the global store
      this.setDoubleClickedSentenceIndexes({
        doubleClickedSentenceIndexes: {
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
      // const matchHighlight = document.querySelector(".match-highlight");
      container.scrollTop = 0;

      const checkIfScrollIsFinished = setInterval(() => {
        if (container.scrollTop === 0) {
          // scrolls container to centralize it to the matched word
          container.scrollLeft =
            matchColumn.offsetLeft +
            matchColumn.offsetWidth / 2 -
            container.offsetWidth / 2;
          clearInterval(checkIfScrollIsFinished);
        }
      }, 20);
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
      this.showLoadingBar();
      // gets the results array and the string
      // indicating which property is being searched
      // organizes all the results at once

      // gets the backend export results route URL
      const exportResultsRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/export-results";

      const requestBody = JSON.stringify({
        organizedResults: this.getEveryResult(),
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

    // gets the markup of matched token of a resulting sentence
    getMatchedTokenMarkUp(resultSentence, tokenId) {
      let formText = resultSentence.tokens[tokenId].form;
      let uposText = "";
      let deprelText = "";
      let featsText = "";

      // show upos
      if (this.getLastSearchParams.shownProps.includes("upos")) {
        // gets upos text
        uposText = "/" + resultSentence.tokens[tokenId].upostag;
      }

      // show deprel
      if (this.getLastSearchParams.shownProps.includes("deprel")) {
        // put id info in the form
        formText = `${resultSentence.tokens[tokenId].form}<sub>${resultSentence.tokens[tokenId].id}</sub>`;

        // gets deprel text
        deprelText =
          "/" +
          resultSentence.tokens[tokenId].deprel +
          "(" +
          resultSentence.tokens[tokenId].head +
          ")";
      }

      // show features
      if (this.getLastSearchParams.shownProps.includes("feats")) {
        // gets feats text
        featsText = "/" + resultSentence.tokens[tokenId].feats;
      }

      return formText + uposText + deprelText + featsText;
    },

    // gets the markup of token in the context of a resulting sentence
    getContextTokenMarkUp(e, heads) {
      let formText = e.form;
      let uposText = "";
      let deprelText = "";
      let featsText = "";
      let openingSpanTag = "";
      let closingSpanTag = "";

      // show upos
      if (this.getLastSearchParams.shownProps.includes("upos")) {
        uposText = "/" + e["upostag"];
      }

      // show deprel
      if (this.getLastSearchParams.shownProps.includes("deprel")) {
        // put id info in the form
        formText = `${e.form}<sub>${e.id}</sub>`;

        // sets tag style if it is a head
        if (heads.includes(e.id)) {
          openingSpanTag = `<span style="background-color: #6bb9f7; color: white;padding: 5px; border-radius: 3px;">`;
          closingSpanTag = "</span>";
        }

        deprelText = "/" + e["deprel"];
      }

      // show features
      if (this.getLastSearchParams.shownProps.includes("feats")) {
        featsText = "/" + e["feats"];
      }

      return (
        openingSpanTag +
        formText +
        uposText +
        deprelText +
        featsText +
        closingSpanTag
      );
    },

    // -- DESCRIPTION
    // this component uses a table to render the results
    // the algorithm bellow pre-process the results in order
    // for them to be usable in the table.
    organizesResults(results) {
      this.organizedResults = [];
      results.forEach((result) => {
        // for each match in this result...

        // gets the matched sentence
        const resultSentence = result.foundSentence;

        let sent_id = resultSentence.metadata.filter(
          (e) => e.key === "sent_id"
        );
        sent_id = sent_id[0]["value"];

        // stores heads
        const heads = [];
        // gets the match
        const match = result["foundNGram"]
          .map((tokenId) => {
            // stores match's head
            heads.push(Number(resultSentence.tokens[tokenId].head));

            // returns matched token's mark up to render in the table rows
            return this.getMatchedTokenMarkUp(resultSentence, tokenId);
          })
          .join("\xa0\xa0\xa0");

        // gets the left context (string)
        const leftContext = resultSentence.tokens
          .slice(0, result["foundNGram"][0])
          .map((e) => {
            // returns context token's mark up to render in the table rows
            return this.getContextTokenMarkUp(e, heads);
          })
          .join("\xa0\xa0\xa0");

        // gets the right context (string)
        const rightContext = resultSentence.tokens
          .slice(
            result["foundNGram"][result["foundNGram"].length - 1] + 1,
            resultSentence.tokens.length
          )
          .map((e) => {
            // returns context token's mark up to render in the table rows
            return this.getContextTokenMarkUp(e, heads);
          })
          .join("\xa0\xa0\xa0");

        // organizes the data and stores it in an array
        this.organizedResults.push({
          sent_id,
          leftContext,
          match,
          rightContext,
        });
      });
    },

    getEveryResult() {
      const allResults = [];
      this.getSearchResults.forEach((result) => {
        // for each match in this result...

        // gets the matched sentence
        const resultSentence = this.getConlluData[result.sentenceIndex];

        let sent_id = resultSentence.metadata.filter(
          (e) => e.key === "sent_id"
        );
        sent_id = sent_id[0]["value"];

        // stores heads
        const heads = [];
        // gets the match
        const match = result["foundNGram"]
          .map((tokenId) => {
            // stores match's head
            heads.push(Number(resultSentence.tokens[tokenId].head));

            // returns matched token's mark up to render in the table rows
            return this.getMatchedTokenMarkUp(resultSentence, tokenId);
          })
          .join("\xa0\xa0\xa0");

        // gets the left context (string)
        const leftContext = resultSentence.tokens
          .slice(0, result["foundNGram"][0])
          .map((e) => {
            // returns context token's mark up to render in the table rows
            return this.getContextTokenMarkUp(e, heads);
          })
          .join("\xa0\xa0\xa0");

        // gets the right context (string)
        const rightContext = resultSentence.tokens
          .slice(
            result["foundNGram"][result["foundNGram"].length - 1] + 1,
            resultSentence.tokens.length
          )
          .map((e) => {
            // returns context token's mark up to render in the table rows
            return this.getContextTokenMarkUp(e, heads);
          })
          .join("\xa0\xa0\xa0");

        // organizes the data and stores it in an array
        allResults.push({
          sent_id,
          leftContext,
          match,
          rightContext,
        });
      });
      return allResults;
    },

    // -- DESCRIPTION:
    // Applies the 'edited' class to edited sentences' rows.
    rowClass(data) {
      return this.getEditedRowsIndexes.includes(data.sent_id) ? "edited" : null;
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
.empty-data-art {
  height: 350px;
  margin-top: 80px;
}

.nothing-found {
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 70px;
}

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
  position: absolute !important;
  right: 0;
  top: 0;
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
