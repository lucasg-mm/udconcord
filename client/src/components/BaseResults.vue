<template>
  <div class="centered-content" :scrollable="true">
    <div class="search-set">
      <InputText
        style="
          min-width: 220px;
          border-radius: 0;
          border-color: black white black black;
          font-family: 'Vidaloka', serif;
        "
        placeholder="Search again"
        type="text"
      />
      <Button
        style="
          border-color: #000099;
          background: #000099;
          font-family: 'Vidaloka', serif;
          border-radius: 0;
        "
        label="Search"
      />
    </div>

    <div class="number-of-results">~ {{ numberOfResults }} results found ~</div>

    <div class="results-set">
      <DataTable
        style="font-family: 'Vidaloka', serif; white-space: nowrap"
        :value="organizedResults"
        :autoLayout="true"
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
import InputText from "primevue/inputtext";
import Button from "primevue/button";

export default {
  props: {
    results: Object,
  },

  components: {
    DataTable,
    Column,
    InputText,
    Button,
  },

  beforeMount() {
    // this component uses a table to render the results
    // the algorithm bellow pre-process the results in order
    // for them to be usable in the table
    console.log(JSON.parse(JSON.stringify(this.results)));
    this.results.forEach((result) => {
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
};
</script>

<style scoped>
.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  width: 1200px;
  padding: 50px;
  background-color: #fff;
}

.search-set {
  padding-bottom: 20px;
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
