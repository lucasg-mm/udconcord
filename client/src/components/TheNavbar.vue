<template>
  <div class="fixed">
    <ProgressBar v-if="getIsLoading" :mode="getMode" :value="getUploadProg" />

    <div class="with-divisor">
      <Menubar :model="items" class="navbar">
        <template #start>
          <router-link to="/">
            <img alt="logo" height="35" src="../assets/logo.svg" />
          </router-link>
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
    ...mapGetters(["getIsLoading", "getUserId", "getUploadProg"]),

    // tells if the progress bar should be indetermined or determined
    // determined if it's uploading
    // indetermined otherwise
    getMode() {
      return this.getUserId ? "indeterminate" : "determinate";
    },
  },
  data() {
    return {
      // items in the navbar's menu
      items: [
        { label: "Home", icon: "pi pi-fw pi-home", to: "/" },
        { label: "Help", icon: "pi pi-fw pi-question-circle", to: "/help" },
      ],
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
  z-index: 3;
}

.with-divisor {
  padding: 0 20px;
}

.p-progressbar {
  height: 3px;
}

.navbar {
  height: 50px;
  border-radius: 0;
  border-width: 0 0 1px 0;
  border-color: #e4e5e8;
  background-color: white;
  color: black;
  font-size: 14px;
}
</style>
