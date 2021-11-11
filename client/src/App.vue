<template>
  <div class="main-view">
    <TheNavbar></TheNavbar>
    <router-view class="showed-content" v-slot="{ Component }">
      <keep-alive v-if="getConlluData">
        <component :is="Component" />
      </keep-alive>
      <component v-else :is="Component" />
    </router-view>
    <TheFooter></TheFooter>
  </div>
</template>

<script>
import TheNavbar from "./components/TheNavbar.vue";
import TheFooter from "./components/TheFooter.vue";
import { mapGetters } from "vuex";

export default {
  name: "App",
  components: {
    TheNavbar,
    TheFooter,
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

.showed-content {
  width: 40%;
  margin: 80px auto 80px auto;
}
</style>
