import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { MsalConfig, SecurityCtxMsal } from "./security";

const demoTenant = true;
const clientId = demoTenant
  ? "07ef8f9b-16b3-4eda-b4e9-4fb74fde14ba"
  : "18550eaf-766e-46c6-bfb9-d26586ebe4c8";
const tenantId = demoTenant
  ? "cf4d5bd1-9959-423a-97bb-b0289b4e7938"
  : "56778bd5-6a3f-4bd3-a265-93163e4d5bfe";

const msalConfig: MsalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
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
