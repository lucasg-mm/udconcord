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
import { mapGetters } from "vuex";
import { mapActions } from "vuex";

export default {
  components: {
    FileUpload,
  },

  computed: {
    //store's getters
    ...mapGetters(["getUserId"]),
  },

  methods: {
    /**
     * -- DESCRIPTION:
     * Maps store's actions to this component.
     */
    ...mapActions(["showLoadingBar", "hideLoadingBar", "setUserId"]),

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
      const res = await fetch(treebanksRouteUrl, {
        method: "POST",
        body: formData,
      });

      const resJson = await res.json();

      this.setUserId({ userId: resJson.userId });

      // hides loading bar
      this.hideLoadingBar();

      // goes to the search route
      this.$router.push("/search");
    },
  },
};
</script>
<style lang="scss" scoped>
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

@media (max-width: 300px) {
  .trees {
    height: 60px;
  }

  .description {
    color: #495057;
    font-size: 15px;
  }

  .heading {
    font-size: 20px;
    font-weight: 700;
  }
}

@media (min-width: 300px) and (max-width: 400px) {
  .trees {
    height: 80px;
  }

  .heading {
    font-size: 30px;
    font-weight: 700;
  }
}

@media (min-width: 400px) and (max-width: 500px) {
  .trees {
    height: 100px;
  }
}

@media (min-width: 500px) and (max-width: 800px) {
  .trees {
    height: 150px;
  }
}
</style>
