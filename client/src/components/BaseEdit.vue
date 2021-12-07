<template>
  <div class="centered-content">
    <Toast></Toast>
    <h1 class="heading">You can edit the sentence's CoNLL-U below!</h1>
    <p class="description">
      Don't forget to save your changes before you quit this screen.
    </p>
    <div class="table-overflow">
      <div class="table-container">
        <DataTable
          editMode="cell"
          class="p-datatable-sm"
          :autoLayout="true"
          :value="editingSentence.metadata"
          contextMenu
          @rowContextmenu="onRowContextMenuMetadata"
        >
          <Column header="Key" field="key">
            <template #editor="slotProps">
              <InputText v-model="slotProps.data[slotProps.field]" />
            </template>
          </Column>
          <Column header="Value" field="value">
            <template #editor="slotProps">
              <InputText v-model="slotProps.data[slotProps.field]" />
            </template>
          </Column>
        </DataTable>
        <DataTable
          editMode="cell"
          class="p-datatable-sm"
          :autoLayout="true"
          columnResizeMode="expand"
          :value="editingSentence.tokens"
          contextMenu
          @rowContextmenu="onRowContextMenuSentence"
        >
          <Column field="id" header="Id">
            <template #editor="slotProps">
              <InputText
                class="id-column"
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="form" header="Form">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="lemma" header="Lemma">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="upostag" header="Upos Tag">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="xpostag" header="Xpos Tag">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="feats" header="Feats">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="head" header="Head">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="deprel" header="DepRel">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="deps" header="Deps">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column field="misc" header="Misc">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
        </DataTable>
        <ContextMenu :model="menuModelMetadata" ref="cm" />
        <ContextMenu :model="menuModelSentence" ref="sent" />
      </div>
    </div>

    <div class="bottom-set">
      <div class="buttons">
        <Button
          icon="pi pi-arrow-left"
          class="back-button p-button-outlined"
          label="Go Back"
          @click="goToSearchResults"
        />
        <Button
          icon="pi pi-save"
          class="save-button"
          label="Save Changes"
          @click="saveChanges"
        />
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
import ContextMenu from "primevue/contextmenu";

export default {
  components: {
    Button,
    Toast,
    DataTable,
    Column,
    InputText,
    ContextMenu,
  },

  emits: ["edited-sentence", "to-results"],

  activated() {
    // makes a deep copy of the sentence the user requested to edit
    this.editingSentence = JSON.parse(
      JSON.stringify(
        this.getSearchResults[
          this.getDoubleClickedSentenceIndexes.searchResultsIndex
        ].foundSentence
      )
    );
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

  computed: {
    /**
     * -- DESCRIPTION:
     * Maps store's getters to this component.
     */
    ...mapGetters([
      "getDoubleClickedSentenceIndexes",
      "getSearchResults",
      "getUserId",
    ]),
  },

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component
     */
    ...mapActions([
      "updateConlluDataEl",
      "pushEditedRowsIndexes",
      "setMadeChanges",
      "resetsEverything",
      "showLoadingBar",
      "hideLoadingBar",
    ]),

    /*
    -- DESCRIPTION:
    Shows the results screen.
    */
    goToSearchResults() {
      // go back to the results screen
      this.$router.back();
    },

    // Update conllu, search results and editedRowsIndexes
    // at the global store.
    updateStore() {
      this.setMadeChanges({ changesBool: true });

      let sent_id = this.editingSentence.metadata.filter(
        (e) => e.key === "sent_id"
      );
      sent_id = sent_id[0]["value"];

      // updates the ids of edited sentences
      this.pushEditedRowsIndexes({
        el: sent_id,
      });
    },

    /*
    -- DESCRIPTION:
    Saves the modifications in the sentence's conllu.
    */
    async saveChanges() {
      this.showLoadingBar();

      // gets the backend treebanks route URL
      const treebanksSearchRouteUrl =
        process.env.VUE_APP_URL + "api/treebanks/update";

      // defining the request's body
      let requestBody = {
        sentenceObj: this.editingSentence,
        userId: this.getUserId,
      };

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
      const responseJson = await response.json();

      if (response.status === 200) {
        // saves modifications in store
        this.updateStore();

        // shows message
        this.$toast.add({
          severity: "info",
          summary: "Saved",
          detail: responseJson.message,
          life: 3000,
        });
      } else {
        // shows message
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: responseJson.message,
          life: 4000,
        });
      }

      this.hideLoadingBar();
    },

    /**
     * -- DESCRIPTION:
     * Shows context menu.
     */
    onRowContextMenuMetadata(event) {
      this.clicked = {
        table: "metadata",
        index: event.index,
      };
      this.$refs.cm.show(event.originalEvent);
    },

    onRowContextMenuSentence(event) {
      this.clicked = {
        table: "tokens",
        index: event.index,
      };
      this.$refs.sent.show(event.originalEvent);
    },

    isMultiWordToken(token) {
      return /(\d*)-(\d*)/.test(token.id);
    },

    getIdBounds(id) {
      return {
        lowerBound: Number(/(\d*)-(\d*)/.exec(id)[1]),
        upperBound: Number(/(\d*)-(\d*)/.exec(id)[2]),
      };
    },

    /**
     * --DESCRIPTION:
     * Adds row above the one clicked.
     */
    addRowAbove(row) {
      // deals with insert of metadata
      if (row.table === "metadata") {
        this.editingSentence[row.table].splice(row.index, 0, {
          key: "_",
          value: "_",
        });
      } else if (row.table === "tokens") {
        if (this.isMultiWordToken(this.editingSentence[row.table][row.index])) {
          this.editingSentence[row.table].splice(row.index, 0, {
            deprel: "_",
            deps: "_",
            feats: "_",
            form: "_",
            head: "_",
            id: this.getIdBounds(this.editingSentence[row.table][row.index].id)
              .lowerBound,
            lemma: "_",
            misc: "_",
            upostag: "_",
            xpostag: "_",
          });
        } else {
          this.editingSentence[row.table].splice(row.index, 0, {
            deprel: "_",
            deps: "_",
            feats: "_",
            form: "_",
            head: "_",
            id: this.editingSentence[row.table][row.index].id,
            lemma: "_",
            misc: "_",
            upostag: "_",
            xpostag: "_",
          });
        }

        // fixes ids
        for (let i = 0; i < this.editingSentence[row.table].length; i++) {
          // head ids
          if (this.editingSentence[row.table][i].head >= row.index + 1) {
            this.editingSentence[row.table][i].head =
              Number(this.editingSentence[row.table][i].head) + 1;
          }

          // token ids
          if (i > row.index) {
            // if it's a multi-word token
            if (/(\d*)-(\d*)/.test(this.editingSentence[row.table][i].id)) {
              let lowerBound =
                Number(
                  /(\d*)-(\d*)/.exec(this.editingSentence[row.table][i].id)[1]
                ) + 1;

              let upperBound =
                Number(
                  /(\d*)-(\d*)/.exec(this.editingSentence[row.table][i].id)[2]
                ) + 1;

              this.editingSentence[row.table][
                i
              ].id = `${lowerBound}-${upperBound}`;
            } else {
              // not a multi-word token
              this.editingSentence[row.table][i].id =
                this.editingSentence[row.table][i].id + 1;
            }
          }
        }
      }

      this.selectedRowIndex = null;
    },

    /**
     * --DESCRIPTION:
     * Adds row below the one clicked.
     */
    addRowBelow(row) {
      // deals with insert of metadata
      if (row.table === "metadata") {
        this.editingSentence[row.table].splice(row.index + 1, 0, {
          key: "_",
          value: "_",
        });
      } else if (row.table === "tokens") {
        if (this.isMultiWordToken(this.editingSentence[row.table][row.index])) {
          this.editingSentence[row.table].splice(row.index + 1, 0, {
            deprel: "_",
            deps: "_",
            feats: "_",
            form: "_",
            head: "_",
            id: this.getIdBounds(this.editingSentence[row.table][row.index].id)
              .lowerBound,
            lemma: "_",
            misc: "_",
            upostag: "_",
            xpostag: "_",
          });
        } else {
          this.editingSentence[row.table].splice(row.index + 1, 0, {
            deprel: "_",
            deps: "_",
            feats: "_",
            form: "_",
            head: "_",
            id: this.editingSentence[row.table][row.index].id + 1,
            lemma: "_",
            misc: "_",
            upostag: "_",
            xpostag: "_",
          });
        }

        // fixes ids
        for (let i = 0; i < this.editingSentence[row.table].length; i++) {
          // head ids
          if (this.editingSentence[row.table][i].head >= row.index + 2) {
            this.editingSentence[row.table][i].head =
              Number(this.editingSentence[row.table][i].head) + 1;
          }

          // token ids
          if (i > row.index + 1) {
            // if it's a multi-word token
            if (/(\d*)-(\d*)/.test(this.editingSentence[row.table][i].id)) {
              let lowerBound =
                Number(
                  /(\d*)-(\d*)/.exec(this.editingSentence[row.table][i].id)[1]
                ) + 1;

              let upperBound =
                Number(
                  /(\d*)-(\d*)/.exec(this.editingSentence[row.table][i].id)[2]
                ) + 1;

              this.editingSentence[row.table][
                i
              ].id = `${lowerBound}-${upperBound}`;
            } else {
              // not a multi-word token
              this.editingSentence[row.table][i].id =
                this.editingSentence[row.table][i].id + 1;
            }
          }
        }
      }

      this.selectedRowIndex = null;
    },

    /**
     * --DESCRIPTION:
     * Deletes clicked row.
     */
    deleteRow(row) {
      let hasToFixIndexes = true;
      if (
        row.table === "tokens" &&
        /(\d*)-(\d*)/.test(this.editingSentence[row.table][row.index].id)
      ) {
        // doesn't have to fix indexes when deleting multi-word tokens
        hasToFixIndexes = false;
      }

      // removes the row
      this.editingSentence[row.table].splice(row.index, 1);

      if (row.table === "tokens" && hasToFixIndexes) {
        // fixes ids
        for (let i = 0; i < this.editingSentence[row.table].length; i++) {
          // head ids
          if (this.editingSentence[row.table][i].head >= row.index + 1) {
            this.editingSentence[row.table][i].head =
              Number(this.editingSentence[row.table][i].head) - 1;
          }

          // token ids
          if (i >= row.index) {
            // if it's a multi-word token
            if (/(\d*)-(\d*)/.test(this.editingSentence[row.table][i].id)) {
              let lowerBound =
                Number(
                  /(\d*)-(\d*)/.exec(this.editingSentence[row.table][i].id)[1]
                ) - 1;

              let upperBound =
                Number(
                  /(\d*)-(\d*)/.exec(this.editingSentence[row.table][i].id)[2]
                ) - 1;

              this.editingSentence[row.table][
                i
              ].id = `${lowerBound}-${upperBound}`;
            } else {
              // not a multi-word token
              this.editingSentence[row.table][i].id =
                this.editingSentence[row.table][i].id - 1;
            }
          }
        }
      }

      this.selectedRowIndex = null;
    },
  },

  data() {
    return {
      // the sentence being edited (a deep copy of the one in the vuex store)
      editingSentence: "",

      // holds the data for the clicked row
      clicked: null,

      // model with options of the context menu (for metadata part)
      menuModelMetadata: [
        {
          label: "Add row above",
          icon: "pi pi-fw pi-angle-double-up",
          command: () => this.addRowAbove(this.clicked),
        },
        {
          label: "Add row below",
          icon: "pi pi-fw pi-angle-double-down",
          command: () => this.addRowBelow(this.clicked),
        },
        {
          label: "Delete",
          icon: "pi pi-fw pi-times",
          command: () => this.deleteRow(this.clicked),
        },
      ],

      // model with options of the context menu (for sentence part)
      menuModelSentence: [
        {
          label: "Add token above",
          icon: "pi pi-fw pi-angle-double-up",
          command: () => this.addRowAbove(this.clicked),
        },
        {
          label: "Add token below",
          icon: "pi pi-fw pi-angle-double-down",
          command: () => this.addRowBelow(this.clicked),
        },
        {
          label: "Delete token",
          icon: "pi pi-fw pi-times",
          command: () => this.deleteRow(this.clicked),
        },
      ],
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap");

.p-inputtext {
  width: 100%;
}

.p-inputtext.id-column {
  width: 50px;
}

.table-overflow {
  overflow: auto;
  height: 600px;
}

.table-container {
  display: table;
  width: 100%;
}

.p-datatable {
  display: table-row;
}

.p-button.back-button {
  margin-top: 20px;
  margin-right: 10px;
}

.p-button.save-button {
  margin-top: 20px;
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
  display: block;
  overflow: auto;
}

.description {
  color: #495057;
  font-size: 18px;
}
</style>
