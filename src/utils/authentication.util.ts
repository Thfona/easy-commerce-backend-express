import { jwtHandlerUtil } from './jwt-handler.util';

class AuthenticationUtil {
  public refreshTokenCookieName = 'easycommerce_refreshtoken';

  public getRefreshTokenCookieString(refreshToken: string, persistSession: boolean): string {
    let expiration = '';

    if (persistSession) {
      expiration = jwtHandlerUtil.getTokenExpirationDate(refreshToken);
    }

    return `${this.refreshTokenCookieName}=${refreshToken}; expires=${expiration}; HttpOnly`;
  }

  public getRemoveRefreshTokenCookieString(): string {
    const expiration = new Date(0);

    return `${this.refreshTokenCookieName}=; expires=${expiration}; HttpOnly`;
  }
}

export const authenticationUtil = new AuthenticationUtil();
