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

export default {
  components: {
    SearchInput,
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
</style>
