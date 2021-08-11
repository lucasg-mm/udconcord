<template>
  <Menubar :model="items" class="navbar">
    <template #start>
      <img alt="logo" height="30" src="../assets/logo.svg" />
    </template>
  </Menubar>
</template>

<script>
import Menubar from "primevue/menubar";

export default {
  components: {
    Menubar,
  },
  data() {
    return {
      // items in the navbar's menu
      items: [
        {
          label: "Home",
        },
        {
          label: "About",
        },
      ],
    };
  },
};
</script>

<style scoped>
.navbar {
  border-radius: 0;
  border-width: 0 0 1px 0;
  border-color: white;
  background-color: white;
  font-family: "Vidaloka", serif;
  color: black;
}
</style>
