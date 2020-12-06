import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { MsalConfig, SecurityCtxMsal } from "./security";

const msalConfig: MsalConfig = {
  auth: {
    clientId: "18550eaf-766e-46c6-bfb9-d26586ebe4c8",
    authority:
      "https://login.microsoftonline.com/56778bd5-6a3f-4bd3-a265-93163e4d5bfe",
    redirectUri: window.location.origin + "/callback",
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  loginType: "popup"
};

async function bootVue() {
  const securityCtx = new SecurityCtxMsal(msalConfig);

  await securityCtx.load();

  Vue.config.productionTip = false;

  Vue.prototype.securityCtx = securityCtx;

  new Vue({
    router,
    data: {
      securityCtx
    },
    render: h =>
      h(App, {
        on: {
          "ouvrir-session": async function() {
            securityCtx.login();
          },
          "fermer-session": function() {
            securityCtx.logout();
          }
        }
      })
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
