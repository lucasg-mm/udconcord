<template>
  <div class="main-view">
    <TheNavbar></TheNavbar>
    <router-view class="showed-content" v-slot="{ Component }">
      <keep-alive v-if="getConlluData">
        <component :is="Component" />
      </keep-alive>
      <component v-else :is="Component" />
    </router-view>
  </div>
</template>

<script>
import TheNavbar from "./components/TheNavbar.vue";
import { mapGetters } from "vuex";

export default {
  name: "App",
  components: {
    TheNavbar,
  },
  computed: {
    //store's getters
    ...mapGetters(["getConlluData"]),
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

html,
body,
#app,
.main-view {
  min-height: 100%;
  min-width: 100%;
  margin: 0;
  background-color: #fff;
}

body {
  padding-bottom: 70px;
}

.showed-content {
  width: 40%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 80px;
}
</style>
