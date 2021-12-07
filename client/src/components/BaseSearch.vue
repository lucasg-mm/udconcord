<template>
  <div class="centered-content">
    <h1 class="heading">Time to make a search in the uploaded file!</h1>
    <p class="description">You can use the input fields below.</p>
    <br />
    <img class="search-art" src="../assets/search.svg" />
    <br />
    <br />
    <br />
    <br />
    <SearchInput></SearchInput>
  </div>
</template>

<script>
import SearchInput from "./SearchInput.vue";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  components: {
    SearchInput,
  },
  // created() {
  //   if (!this.getConlluData) {
  //     window.location.href = "/";
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
    ...mapGetters(["getConlluData"]),
  },
  methods: {
    //Maps store's actions to this component
    ...mapActions(["resetsEverything"]),
  },
};
</script>

<style scoped>
.centered-content {
  font-family: "Roboto", sans-serif;
  text-align: center;
  background-color: #eff4f8;
  padding: 50px;
  min-width: 85%;
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

.search-art {
  height: 350px;
}

@media (max-width: 300px) {
  .search-art {
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

  .centered-content {
    padding: 20px;
  }
}

@media (min-width: 300px) and (max-width: 400px) {
  .centered-content {
    padding: 20px;
  }

  .search-art {
    height: 80px;
  }

  .heading {
    font-size: 30px;
    font-weight: 700;
  }
}

@media (min-width: 400px) and (max-width: 500px) {
  .search-art {
    height: 100px;
  }
}

@media (min-width: 500px) and (max-width: 800px) {
  .search-art {
    height: 150px;
  }
}
</style>
