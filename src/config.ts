import { MsalConfig } from "./security";

export interface Config {
  msal: MsalConfig,
  toggles: {
    superFeature: boolean
  }
}

export function createMainConfig(): Config {
  const isProd = window.location.host.indexOf("prod") >= 0 || window.location.host.indexOf("ulaval.ca") >= 0;
  const upToLocal = window.location.host.indexOf("localhost") >= 0;
  const upToDev = !isProd && (upToLocal || window.location.host.indexOf("dev") >= 0);
  const upToApp = !isProd && (upToDev || window.location.host.indexOf("app") >= 0);

  return {
    msal: {
      auth: {
        clientId: "07ef8f9b-16b3-4eda-b4e9-4fb74fde14ba",
        authority: "https://login.microsoftonline.com/cf4d5bd1-9959-423a-97bb-b0289b4e7938",
        redirectUri: window.location.origin + "/callback",
        postLogoutRedirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
      },
      loginType: "popup",
    },
    toggles: {
      superFeature: upToApp,
    },
  };
}
