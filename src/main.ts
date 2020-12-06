import {
  AccountInfo,
  AuthenticationResult,
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

interface SecurityCtx {
  account: AccountInfo | string | null;
  hasDevopsRole: boolean;
}

const securityCtx: SecurityCtx = {
  account: null,
  hasDevopsRole: false
};

type IdTokenClaims = { roles?: string[] };

function updateSecurityCtx(result: AuthenticationResult): void {
  const roles = (result.idTokenClaims as IdTokenClaims).roles;

  securityCtx.account = result.account;
  securityCtx.hasDevopsRole = roles
    ? roles.findIndex(role => role === "devops") >= 0
    : false;
  localStorage.setItem("login_hint", securityCtx.account.username);
}

async function login() {
  msalInstance.loginRedirect({
    scopes: ["openid"]
  });
  /*try {
    const res = await msalInstance.loginPopup({
      scopes: ["openid"]
    });
    updateSecurityCtx(res);
  } catch (e) {
    console.info(e);
  }*/
}

async function logout() {
  msalInstance.logout();
}

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
            login();
          },
          "fermer-session": function() {
            logout();
          }
        }
      })
  }).$mount("#app");
}

async function tryHandleRedirect(): Promise<boolean> {
  const response = await msalInstance.handleRedirectPromise();

  if (response) {
    updateSecurityCtx(response);
    console.info("Redirect: " + securityCtx.account);
    return true;
  }

  return false;
}

async function trySilentLogin() {
  const loginHint = localStorage.getItem("login_hint");

  if (loginHint) {
    console.info("Trying silent...");
    try {
      const res = await msalInstance.ssoSilent({
        loginHint
      });
      console.info("Silent worked.");
      updateSecurityCtx(res);
    } catch (e) {
      console.warn(e);
    }
  }
}

async function tryLoginFromCache(): Promise<boolean> {
  const accounts = msalInstance.getAllAccounts();

  if (accounts && accounts.length > 0) {
    try {
      const res = await msalInstance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["openid"]
      });
      updateSecurityCtx(res);
      console.info("acquireTokenSilent worked");
      return true;
    } catch (e) {
      console.warn(e);
    }
  }

  return false;
}

async function boot() {
  try {
    const workedFromCache = await tryLoginFromCache();

    if (!workedFromCache) {
      // On doit traiter le cas du redirect
      const isRedirect = await tryHandleRedirect();

      if (!isRedirect) {
        // Si on n'est pas dans une requête de redirect, on tente une authentification silencieuse
        await trySilentLogin();
      }
    }

    // Inutile de démarrer l'application dans le cas d'une requête de type redirect
    bootVue();
  } catch (e) {
    console.warn(e);
  }
}

boot();
