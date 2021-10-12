<template>
  <div class="centered-content">
    <h1 class="heading">Please, submit your treebank!</h1>
    <p class="description">
      Remember, your file must be in the CoNLL-U format.
    </p>
    <br />
    <img class="trees" src="../assets/trees.svg" />
    <br />
    <br />
    <br />
    <FileUpload
      chooseLabel="Choose file"
      class="p-fileupload-lg"
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

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component.
     */
    ...mapActions(["setConlluData", "showLoadingBar", "hideLoadingBar"]),

    // -- DESCRIPTION:
    // Uploads CoNLL-U file to the backend
    async uploadFile(event) {
      // shows loading bar
      this.showLoadingBar();

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

      // console.log(conlluData);

      // hides loading bar
      this.hideLoadingBar();

      // goes to the search route
      this.$router.push("/search");
    },
  },
};
</script>
<style lang="scss" scoped>
.p-fileupload::v-deep .p-button {
  padding: 10px 32px;
  font-size: 20px;
  border-radius: 5px;
}

.heading {
  font-size: 40px;
  font-weight: 700;
}

.description {
  color: #495057;
  font-size: 20px;
}

.centered-content {
  font-family: "Roboto", sans-serif;
  text-align: center;
  background-color: #eff4f8;
  padding: 50px;
  min-width: 65%;
  border-radius: 5px;
}

.trees {
  height: 350px;
}
</style>
