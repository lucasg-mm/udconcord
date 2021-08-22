<template>
  <div class="centered-content">
    <p class="heading">You can edit the sentence's CoNLL-U below!</p>
    <Textarea v-model="conlluCode" />
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

export default {
  components: {
    Textarea,
    Button,
  },

  emits: ["edited-sentence", "to-results"],

  props: {
    sentence: Object,
  },

  mounted() {
    this.conlluCode = this.sentence.conllu;
  },

  methods: {
    /*
    -- DESCRIPTION:
    Shows the results screen.
    */
    goToSearchResults() {
      this.$emit("to-results");
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
        conllu: this.conlluCode,
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

      // emits event to indicate the sentence was edited,
      // sending the new object
      this.$emit("edited-sentence", {
        index: this.sentence.index,
        sentence: sentenceObject,
      });
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
