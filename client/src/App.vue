<template>
  <div class="main-view">
    <TheNavbar></TheNavbar>
    <!-- <keep-alive>
      <router-view class="showed-content"></router-view>
    </keep-alive> -->
    <router-view class="showed-content" v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script>
import TheNavbar from "./components/TheNavbar.vue";

export default {
  name: "App",
  components: {
    TheNavbar,
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Vidaloka&display=swap");

html,
body,
#app,
.main-view {
  min-height: 100%;
  min-width: 100%;
  margin: 0;
  background-color: #ccdde8;
  /* background-color: white; */
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
