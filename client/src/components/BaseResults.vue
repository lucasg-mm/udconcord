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
    this.results.forEach((result) => {
      result["foundTokensIds"].forEach((foundTokenId) => {
        const resultSentence = result["sentence"];
        const matchIndex = foundTokenId - 1;

        const leftContext = resultSentence.tokens
          .slice(0, matchIndex)
          .map((e) => e.form)
          .join(" ");

        const match = resultSentence.tokens[matchIndex].form;

        const rightContext = resultSentence.tokens
          .slice(matchIndex + 1, resultSentence.tokens.length)
          .map((e) => e.form)
          .join(" ");

        this.organizedResults.push({
          leftContext,
          match,
          rightContext,
        });
      });
    });
  },

  mounted() {
    let element = document.querySelector(".match-column");
    console.log(element);
    element.scrollIntoView({ inline: "center" });
    // this.$refs["match-column"].scrollIntoView({ behavior: "smooth" });
  },

  data() {
    return {
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
  height: 600px;
  padding: 50px;
  background-color: #fff;
}

.search-set {
  padding-bottom: 30px;
}

.results-set {
  height: 450px;
  overflow: auto;
}
</style>
