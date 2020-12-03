import {
  AccountInfo,
  Configuration,
  PublicClientApplication
} from "@azure/msal-browser";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";

const msalConfig: Configuration = {
  auth: {
    clientId: "18550eaf-766e-46c6-bfb9-d26586ebe4c8",
    authority:
      "https://login.microsoftonline.com/56778bd5-6a3f-4bd3-a265-93163e4d5bfe",
    redirectUri: window.location.origin + "/callback",
    postLogoutRedirectUri: window.location.origin + "/logout",
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

const securityCtx = {
  account: null
} as { account: AccountInfo | string | null };

function bootVue() {
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
            //msalInstance.loginRedirect();
            try {
              const res = await msalInstance.loginPopup();
              securityCtx.account = res.account;
              localStorage.setItem("login_hint", securityCtx.account.username);
            } catch (e) {
              console.info(e);
            }
          },
          "fermer-session": function() {
            msalInstance.logout();
          }
        }
      })
  }).$mount("#app");
}

async function handleRedirect(): Promise<boolean> {
  const response = await msalInstance.handleRedirectPromise();

  if (response) {
    securityCtx.account = response.account;
    console.info("Redirect: " + securityCtx.account);
    localStorage.setItem("login_hint", securityCtx.account.username);
    return true;
  }

  return false;
}

async function trySilent() {
  const loginHint = localStorage.getItem("login_hint");

  if (loginHint) {
    console.info("Trying silent...");
    try {
      const res = await msalInstance.ssoSilent({
        loginHint
      });
      console.info("Silent worked.");
      securityCtx.account = res.account;
    } catch (e) {
      console.warn(e);
    }
  }
}

async function boot() {
  try {
    const accounts = msalInstance.getAllAccounts();

    // Sommes-nous déjà authentifié ?
    if (accounts && accounts.length > 0) {
      securityCtx.account = accounts[0];
    } else {
      // On doit traiter le cas du redirect
      if (!(await handleRedirect())) {
        // Si on n'est pas dans une requête de redirect, on tente une authentification silencieuse
        await trySilent();
      }
    }
    bootVue();
  } catch (e) {
    console.info(e);
  }
}

boot();
