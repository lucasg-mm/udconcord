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
          border-radius: 0;
        "
        class="export-button"
        label="Export Results"
        @click="exportResults"
      />
    </div>

    <div class="number-of-results">~ {{ numberOfResults }} results found ~</div>

    <div class="results-set">
      <DataTable
        style="font-family: 'Vidaloka', serif; white-space: nowrap"
        :value="organizedResults"
        :autoLayout="true"
        breakpoint="425px"
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
              style="background-color: #6666ff; color: white; padding: 5px"
              >{{ data.match }}</span
            >
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
    results: Object,
    conlluData: Object,
  },

  components: {
    SearchInput,
    DataTable,
    Column,
    Button,
  },

  beforeMount() {
    this.organizesResults(this.results);
  },

  mounted() {
    // gets the body of the column with the match results
    let element = document.querySelector(".match-column");

    // scrolls this element to the center of the screen
    element.scrollIntoView({ inline: "center" });
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
    // -- DESCRIPTION
    // this component uses a table to render the results
    // the algorithm bellow pre-process the results in order
    // for them to be usable in the table.
    organizesResults(results) {
      this.organizedResults = [];
      results.forEach((result) => {
        // for each result...
        result["foundNGramIdGroups"].forEach((foundNGramIdGroup) => {
          // for each match in this result...

          // gets the matched sentence
          const resultSentence = result["sentence"];

          // gets the left context (string)
          const leftContext = resultSentence.tokens
            .slice(0, foundNGramIdGroup[0])
            .map((e) => e.form)
            .join(" ");

          // gets the match
          const match = foundNGramIdGroup
            .map((tokenId) => resultSentence.tokens[tokenId].form)
            .join(" ");

          // gets the right context (string)
          const rightContext = resultSentence.tokens
            .slice(
              foundNGramIdGroup[foundNGramIdGroup.length - 1] + 1,
              resultSentence.tokens.length
            )
            .map((e) => e.form)
            .join(" ");

          // organizes the data and stores it in an array
          this.organizedResults.push({
            leftContext,
            match,
            rightContext,
          });
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
      this.organizesResults(event.searchResults);
    },
  },
};
</script>

<style scoped>
.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  width: 80%;
  padding: 50px;
  background-color: #fff;
}

.top-set {
  padding-bottom: 20px;
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
}

.number-of-results {
  color: #000099;
  padding-bottom: 15px;
}
</style>
