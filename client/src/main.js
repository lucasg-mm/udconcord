// imports Vue and PrimeVue framework
import { createApp } from "vue";
import store from "./store/index.js";
import App from "./App.vue";
import PrimeVue from "primevue/config";

// imports PrimeVue Styles
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// creates app
const app = createApp(App);

// uses
app.use(PrimeVue);
app.use(store);

// mounts app
app.mount("#app");
