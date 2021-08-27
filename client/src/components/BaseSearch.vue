<template>
  <div>
    <div class="centered-content">
      <p class="heading">Time to search!</p>
      <p class="description">You can use the input fields below.</p>
      <br />
      <i class="fas fa-search search-icon"></i>
      <br />
      <br />
      <br />
      <br />
      <SearchInput></SearchInput>
    </div>
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
  font-family: "Vidaloka", serif;
  text-align: center;
  background-color: white;
  padding: 35px 25px 35px 25px;
  min-width: 250px;
  border-radius: 5px;
}

.heading {
  font-size: 30px;
  margin-top: 0;
}

.description {
  color: #495057;
  font-size: 16px;
}

.search-icon {
  font-size: 86px;
}
</style>
