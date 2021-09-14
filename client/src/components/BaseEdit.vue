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
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
            </template>
          </Column>
          <Column header="Value" field="value">
            <template #editor="slotProps">
              <InputText
                v-model="slotProps.data[slotProps.column.props.field]"
              />
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
        this.getConlluData[this.getDoubleClickedSentenceIndexes.conlluDataIndex]
      )
    );
  },

  computed: {
    /**
     * -- DESCRIPTION:
     * Maps store's getters to this component.
     */
    ...mapGetters(["getConlluData", "getDoubleClickedSentenceIndexes"]),
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
    updateStore() {
      // updates the conlluData Vuex array
      this.updateConlluDataEl({
        el: this.editingSentence,
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
      // saves modifications in store
      this.updateStore();

      // shows message
      this.$toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Your changes have been successfully saved!",
        life: 3000,
      });
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
        this.editingSentence[row.table].splice(row.index + 1, 0, {
          deprel: "_",
          deps: "_",
          feats: "_",
          form: "_",
          head: "_",
          id: row.index + 2,
          lemma: "_",
          misc: "_",
          upostag: "_",
          xpostag: "_",
        });

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
          label: "Add multi-word token above",
          icon: "pi pi-fw pi-caret-up",
          command: () => console.log("above"),
        },
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
          label: "Add multi-word token below",
          icon: "pi pi-fw pi-caret-down",
          command: () => console.log("below"),
        },
        {
          label: "Delete",
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
