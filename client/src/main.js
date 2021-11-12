// imports
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import store from "./store/index.js";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import BaseUpload from "./components/BaseUpload.vue";
import BaseSearch from "./components/BaseSearch.vue";
import BaseResults from "./components/BaseResults.vue";
import PageNotFound from "./components/PageNotFound.vue";
import BaseEdit from "./components/BaseEdit.vue";
import BaseHelp from "./components/BaseHelp.vue";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";

// imports PrimeVue Styles
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// creates
const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: BaseUpload,
    },
    {
      path: "/search",
      component: BaseSearch,
    },
    {
      path: "/results",
      component: BaseResults,
    },
    {
      path: "/edit",
      component: BaseEdit,
    },
    {
      path: "/help",
      component: BaseHelp,
    },
    { path: "/:pathMatch(.*)*", component: PageNotFound },
  ],
});

// uses
app.use(PrimeVue);
app.use(store);
app.use(router);
app.use(ToastService);
app.directive("tooltip", Tooltip);

// mounts app
app.mount("#app");
