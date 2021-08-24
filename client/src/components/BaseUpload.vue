<template>
  <div class="centered-content">
    <p class="heading">Please, submit your treebank!</p>
    <p class="description">
      Remember, your file must be in the CoNLL-U format.
    </p>
    <br />
    <i class="fas fa-tree tree-icon"></i>
    <br />
    <br />
    <br />
    <FileUpload
      style="
        border-color: #000099;
        background: #000099;
        font-family: 'Vidaloka', serif;
        border-radius: 5px;
      "
      mode="basic"
      accept=".conllu"
      :maxFileSize="100000000"
      :customUpload="true"
      @uploader="uploadFile"
    />
  </div>
</template>
<script>
import FileUpload from "primevue/fileupload";
import { mapActions } from "vuex";

export default {
  components: {
    FileUpload,
  },

  emits: ["conllu-data-received"],

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component
     */
    ...mapActions(["setConlluData"]),

    // -- DESCRIPTION:
    // Uploads CoNLL-U file to the backend
    async uploadFile(event) {
      // gets the backend treebanks route URL
      const treebanksRouteUrl = process.env.VUE_APP_URL + "api/treebanks";

      // instantiates new FormData to send the file
      const formData = new FormData();

      // adds file to FormData
      formData.append("conlluFile", event.files[0]);

      // makes request to backend
      const response = await fetch(treebanksRouteUrl, {
        method: "POST",
        body: formData,
      });

      // parses the conllu data in the response to JSON
      const conlluData = await response.json();

      // defines the conlluData in the store
      this.setConlluData({ conlluData });

      // emits event to tell the parent component that the conllu
      // data was received, and sends the data
      this.$emit("conllu-data-received");
    },
  },
};
</script>
<style scoped>
.heading {
  font-size: 30px;
  margin-top: 0;
}

.description {
  color: #495057;
  font-size: 16px;
}

.centered-content {
  font-family: "Vidaloka", serif;
  text-align: center;
  background-color: white;
  padding: 35px 25px 35px 25px;
  min-width: 250px;
  border-radius: 5px;
}

.tree-icon {
  font-size: 86px;
}
</style>
