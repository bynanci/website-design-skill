import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/styles/tokens.scss";
import "@/styles/themes.css";
import DashboardView from "@/views/DashboardView.vue";

createApp(DashboardView).use(createPinia()).mount("#app");
