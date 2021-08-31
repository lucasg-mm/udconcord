<template>
  <div class="centered-content">
    <Toast></Toast>
    <h1 class="heading">You can edit the sentence's CoNLL-U below!</h1>
    <p class="description">
      Don't forget to save your changes before you quit this screen.
    </p>
    <div class="table-container">
      <DataTable
        class="metadata-table"
        :autoLayout="true"
        columnResizeMode="expand"
        :value="metadata"
      >
        <Column header="Metadata" field="meta"> </Column>
      </DataTable>
      <DataTable
        editMode="cell"
        class="editable-cells-table"
        :autoLayout="true"
        columnResizeMode="expand"
        :value="
          getConlluData[getDoubleClickedSentenceIndexes.conlluDataIndex].tokens
        "
      >
        <Column field="id" header="Id">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="form" header="Form">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="lemma" header="Lemma">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="upostag" header="Upos Tag">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="xpostag" header="Xpos Tag">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="feats" header="Feats">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="head" header="Head">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="deprel" header="DepRel">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="deps" header="Deps">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="misc" header="Misc">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="bottom-set">
      <div class="buttons">
        <Button
          class="back-button p-button-outlined"
          label="Go Back"
          @click="goToSearchResults"
        />
        <Button class="save-button" label="Save Changes" @click="saveChanges" />
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from "primevue/datatable";
import Button from "primevue/button";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import Toast from "primevue/toast";
import Column from "primevue/column";
import InputText from "primevue/inputtext";

export default {
  components: {
    Button,
    Toast,
    DataTable,
    Column,
    InputText,
  },

  emits: ["edited-sentence", "to-results"],

  props: {
    sentence: Object,
  },

  mounted() {
    console.log(
      this.getConlluData[this.getDoubleClickedSentenceIndexes.conlluDataIndex]
    );
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

    /**
     * -- DESCRIPTION:
     * Holds the metadata of the edited sentence.
     */
    metadata() {
      let metadata = [];

      for (const key in this.getConlluData[
        this.getDoubleClickedSentenceIndexes.conlluDataIndex
      ].metadata) {
        metadata.push({
          meta: `# ${key}=${
            this.getConlluData[
              this.getDoubleClickedSentenceIndexes.conlluDataIndex
            ].metadata[key]
          }`,
        });
      }

      console.log(metadata);

      return metadata;
    },
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
      // go back to the results screen
      this.$router.back();
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

      // shows message
      this.$toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Your changes have been successfully saved!",
        life: 3000,
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

.table-container {
  overflow: auto;
}

.p-datatable {
  width: 100%;
  height: 300px;
  display: table-row;
}

.p-datatable.metadata-table {
  height: auto;
}

Textarea {
  resize: none;
  font-family: "Roboto Mono", monospace;
  width: 100%;
  height: 450px;
  border-width: 0;
  font-size: 15px;
}

.p-button {
  padding: 10px 32px;
  font-size: 18px;
  border-width: 2px;
  border-color: #000099;
  background: #000099;
  font-family: "Roboto", sans-serif;
  border-radius: 0 5px 5px 0;
}

.p-button.save-button:hover {
  background: #000066 !important;
  color: #ffffff !important;
  border-color: #000066 !important;
}

.p-button.save-button:active {
  background: #0000e6 !important;
  color: #ffffff !important;
  border-color: #0000e6 !important;
}

.p-button.back-button:hover {
  border-color: #000066 !important;
  color: #000066 !important;
}

.p-button.back-button:active {
  border-color: #0000e6 !important;
  color: #0000e6 !important;
}

.p-button.back-button {
  margin-top: 20px;
  margin-right: 10px;
  border-color: #000099;
  color: #000099;
  font-family: "Roboto", sans-serif;
  border-radius: 5px;
}

.p-button.save-button {
  margin-top: 20px;
  border-color: #000099;
  background: #000099;
  font-family: "Roboto", sans-serif;
  border-radius: 5px;
}

.bottom-set {
  position: relative;
}

.buttons {
  position: absolute;
  top: 0;
  right: 0;
}

.heading {
  font-size: 35px;
  font-weight: 700;
}

.centered-content {
  font-family: "Roboto", sans-serif;
  text-align: center;
  width: 90%;
  padding: 50px 50px 90px 50px;
  background-color: #eff4f8;
  border-radius: 5px;
}

.description {
  color: #495057;
  font-size: 18px;
}
</style>
