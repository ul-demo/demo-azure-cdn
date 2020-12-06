import {
  AuthenticationResult,
  Configuration,
  PublicClientApplication
} from "@azure/msal-browser";

export interface SecurityCtx {
  readonly authenticated: boolean;
  readonly nickName: string | undefined;
  readonly hasDevopsRole: boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
}

export interface MsalConfig extends Configuration {
  loginType: "popup" | "redirect";
}

type IdTokenClaims = { roles?: string[] };

async function _try(fc: () => Promise<boolean>) {
  try {
    return await fc();
  } catch (e) {
    console.warn(e);
  }
  return false;
}

export class SecurityCtxMsal implements SecurityCtx {
  public authenticated = false;
  public nickName: string | undefined;
  public hasDevopsRole = false;
  private msalInstance: PublicClientApplication;

  constructor(private config: MsalConfig) {
    this.msalInstance = new PublicClientApplication(config);
  }

  async login(): Promise<void> {
    const request = {
      scopes: ["openid"]
    };

    if (this.config.loginType === "redirect") {
      this.msalInstance.loginRedirect(request);
    } else {
      const res = await this.msalInstance.loginPopup(request);
      this.onLogin(res);
    }
  }

  async logout() {
    this.authenticated = false;
    this.hasDevopsRole = false;
    this.nickName = undefined;
    this.msalInstance.logout();
  }

  /**
   * Permet de charger l'information sur l'utilisateur courant.
   */
  async load() {
    (await _try(() => this.loadFromCache())) ||
      (await _try(() => this.loadFromRedirect())) ||
      (await _try(() => this.loadSilent()));
  }

  /**
   * Permet de charger l'info de sécurité pour un utilisateur déjà authentifié en
   * utilisant l'information de la cache.
   */
  private async loadFromCache(): Promise<boolean> {
    const accounts = this.msalInstance.getAllAccounts();

    if (!accounts || accounts.length <= 0) {
      return false;
    }

    console.debug("Trying to load idToken from cache...");
    const res = await this.msalInstance.acquireTokenSilent({
      account: accounts[0],
      scopes: ["openid"]
    });
    console.debug("Load idToken from cache worked.");
    this.onLogin(res);
    return true;
  }

  /**
   * Permet de charger l'info de sécurité pour un utilisateur mais uniquement lors du retour
   * de l'authentification en mode "redirect" en utilisant le code disponible via le hash de
   * l'url courant.
   */
  private async loadFromRedirect(): Promise<boolean> {
    const response = await this.msalInstance.handleRedirectPromise();

    if (!response) {
      return false;
    }

    console.debug("Handling redirect request for " + response.account.username);
    this.onLogin(response);
    return true;
  }

  /**
   * Permet de charger l'info de sécurité pour un utilisateur déjà authentifié et ayant
   * déjà autorisé le consentement.
   *
   * Cette méthode utilise un iFrame caché pour communiquer avec le serveur OAuth.
   *
   * Un login_hint semble nécessaire pour utiliser cette méthode.
   * Le login_hint est obtenu de la session précédente et on assume que l'utilisateur est le même.
   */
  private async loadSilent(): Promise<boolean> {
    const loginHint = localStorage.getItem("login_hint");

    if (!loginHint) {
      return false;
    }

    console.debug("Trying silent login...");
    const res = await this.msalInstance.ssoSilent({
      loginHint
    });
    console.debug("Silent login worked.");
    this.onLogin(res);
    return true;
  }

  private onLogin(result: AuthenticationResult): void {
    this.authenticated = true;
    this.nickName = result.account.name;
    this.hasDevopsRole = SecurityCtxMsal.hasRole(result, "devops");

    localStorage.setItem("login_hint", result.account.username);
  }

  private static hasRole(result: AuthenticationResult, role: string): boolean {
    return (
      SecurityCtxMsal.getRoles(result).findIndex(
        currentRole => currentRole === role
      ) >= 0
    );
  }

  private static getRoles(result: AuthenticationResult): string[] {
    return (result.idTokenClaims as IdTokenClaims).roles ?? [];
  }
}
