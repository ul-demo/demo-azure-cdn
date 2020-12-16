import Vue from "vue";

import App from "./App.vue";
import * as config from "./config";
import router from "./router";
import { SecurityCtxMsal } from "./security";


async function bootVue() {
  const mainConfig = config.createMainConfig();
  const securityCtx = new SecurityCtxMsal(mainConfig.msal);

  await securityCtx.load();

  Vue.config.productionTip = false;
  Vue.prototype.securityCtx = securityCtx;
  Vue.prototype.toggles = mainConfig.toggles;

  new Vue({
    router,
    data: {
      securityCtx,
    },
    render: h =>
      h(App, {
        on: {
          "ouvrir-session": async function () {
            securityCtx.login();
          },
          "fermer-session": function () {
            securityCtx.logout();
          },
        },
      }),
  }).$mount("#app");
}

async function boot() {
  try {
    bootVue();
  } catch (e) {
    console.warn(e);
  }
}

boot();
