import { jwtHandlerUtil } from './jwt-handler.util';

class AuthenticationUtil {
  public getRefreshTokenCookieString(refreshToken: string, persistSession: boolean): string {
    let expiration = '';

    if (persistSession) {
      expiration = jwtHandlerUtil.getTokenExpirationDate(refreshToken);
    }

    return `refreshToken=${refreshToken}; expires=${expiration}; HttpOnly`;
  }

  public getRemoveRefreshTokenCookieString(): string {
    const expiration = new Date(0);

    return `refreshToken=; expires=${expiration}; HttpOnly`;
  }
}

export const authenticationUtil = new AuthenticationUtil();
