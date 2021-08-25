<template>
  <div class="centered-content">
    <p class="heading">You can edit the sentence's CoNLL-U below!</p>
    <Textarea
      v-model="
        this.getConlluData[this.getDoubleClickedSentenceIndexes.conlluDataIndex]
          .conllu
      "
    />
    <Button
      style="
        margin-top: 20px;
        border-color: #000099;
        background: #000099;
        font-family: 'Vidaloka', serif;
        border-radius: 5px;
      "
      label="Save Changes"
      @click="saveChanges"
    />
    <Button
      style="
        margin-top: 20px;
        border-color: #000099;
        background: #000099;
        font-family: 'Vidaloka', serif;
        border-radius: 5px;
      "
      label="Go Back"
      @click="goToSearchResults"
    />
  </div>
</template>

<script>
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  components: {
    Textarea,
    Button,
  },

  emits: ["edited-sentence", "to-results"],

  props: {
    sentence: Object,
  },

  computed: {
    /**
     * -- DESCRIPTION:
     * Maps store's getters to this component.
     */
    ...mapGetters([
      "getConlluData",
      "getDoubleClickedSentenceIndexes",
      "getSearchResults",
    ]),
  },

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component
     */
    ...mapActions(["updateConlluDataEl", "pushEditedRowsIndexes"]),

    /*
    -- DESCRIPTION:
    Shows the results screen.
    */
    goToSearchResults() {
      this.$emit("to-results");
    },

    /**
     * -- DESCRIPTION:
     * Update conllu, search results and editedRowsIndexes
     * at the global store.
     */
    updateStore(updatedSentence) {
      // updates the sentence in the global conllu array
      this.updateConlluDataEl({
        el: updatedSentence,
        index: this.getDoubleClickedSentenceIndexes.conlluDataIndex,
      });

      // updates the ids of edited sentences
      this.pushEditedRowsIndexes({
        el: this.getDoubleClickedSentenceIndexes.searchResultsIndex,
      });
    },

    /*
    -- DESCRIPTION:
    Saves the modifications in the sentence's conllu.
    */
    async saveChanges() {
      // gets the backend treebanks route URL
      const treebanksEditRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/edit";

      // defining the request's body
      const requestBody = {
        conllu:
          this.getConlluData[
            this.getDoubleClickedSentenceIndexes.conlluDataIndex
          ].conllu,
      };

      // makes the request
      const response = await fetch(treebanksEditRouteUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // parses results to javascript object
      const sentenceObject = await response.json();

      // saves modifications in store
      this.updateStore(sentenceObject);
    },
  },

  data() {
    return {
      conlluCode: "",
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap");

Textarea {
  resize: none;
  font-family: "Roboto Mono", monospace;
  width: 100%;
  height: 450px;
  border-width: 0;
  font-size: 15px;
}

.heading {
  font-size: 25px;
  margin-top: 0;
}

.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  width: 80%;
  padding: 50px;
  background-color: #fff;
  border-radius: 5px;
}
</style>
