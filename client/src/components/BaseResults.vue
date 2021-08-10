<template>
  <ul class="centered-content">
    <table>
      <ResultRow
        v-for="sentence in finalResults"
        :result="sentence.result"
        :match-index="sentence.matchIndex"
        :key="sentence.result.metadata.sent_id"
      ></ResultRow>
    </table>
  </ul>
</template>

<script>
import ResultRow from "./ResultRow.vue";

export default {
  props: {
    results: Object,
  },

  components: {
    ResultRow,
  },

  beforeMount() {
    this.finalResults = [];

    this.results.forEach((result) => {
      result["foundTokensIds"].forEach((foundTokenId) => {
        this.finalResults.push({
          result: result["sentence"],
          matchIndex: foundTokenId - 1,
        });
      });
    });
  },

  data() {
    return {
      finalResults: [],
    };
  },
};
</script>

<style scoped>
.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  width: 1200px;
  height: 400px;
  overflow: auto;
  background-color: white;
  padding: 50px;
}
</style>
