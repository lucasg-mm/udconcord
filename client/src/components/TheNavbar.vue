<template>
  <div class="fixed">
    <ProgressBar v-if="getIsLoading" mode="indeterminate" />

    <div class="with-divisor">
      <Menubar :model="items" class="navbar">
        <template #start>
          <img alt="logo" height="35" src="../assets/logo.svg" />
        </template>
      </Menubar>
    </div>
  </div>
</template>

<script>
import Menubar from "primevue/menubar";
import ProgressBar from "primevue/progressbar";
import { mapGetters } from "vuex";

export default {
  components: {
    Menubar,
    ProgressBar,
  },
  computed: {
    /**
     * -- DESCRIPTION:
     * Maps store's getters to this component.
     */
    ...mapGetters(["getIsLoading"]),
  },
  data() {
    return {
      // items in the navbar's menu
      items: [],
    };
  },
};
</script>

<style lang="scss" scoped>
.fixed {
  position: fixed; /* Set the navbar to fixed position */
  top: 0; /* Position the navbar at the top of the page */
  width: 100%; /* Full width */
  background-color: white;
  z-index: 2;
}

.with-divisor {
  padding: 0 20px;
}

.p-progressbar {
  height: 5px;
}

.navbar {
  height: 50px;
  border-radius: 0;
  border-width: 0 0 1px 0;
  border-color: #e4e5e8;
  background-color: white;
  font-family: "Vidaloka", serif;
  color: black;
}
</style>
