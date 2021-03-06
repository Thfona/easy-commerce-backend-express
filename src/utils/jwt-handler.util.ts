import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authenticationUtil } from './authentication.util';
import { environmentUtil } from './environment.util';
import { userModel } from '../models/user.model';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { errorMessageUtil } from './error-message.util';
import { errorResponseUtil } from './error-response.util';
import { messages } from '../constants/messages.constant';

class JwtHandlerUtil {
  private accessTokenSignOptions: SignOptions = {
    expiresIn: '30m'
  };

  private refreshTokenSignOptions: SignOptions = {
    expiresIn: '7d'
  };

  private validationTokenSignOptions: SignOptions = {
    expiresIn: '2h'
  };

  public getTokenExpirationDate(token: string): string {
    const decodedToken = jwt.decode(token);

    if (typeof decodedToken === 'object' && decodedToken !== null) {
      const date = new Date(decodedToken.exp * 1000);

      return date.toUTCString();
    }

    return new Date().toUTCString();
  }

  public signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, environmentUtil.accessTokenSecret, this.accessTokenSignOptions);
  }

  public signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, environmentUtil.refreshTokenSecret, this.refreshTokenSignOptions);
  }

  public signValidationToken(payload: TokenPayload): string {
    return jwt.sign(payload, environmentUtil.validationTokenSecret, this.validationTokenSignOptions);
  }

  public async revokeUserTokens(userId: string): Promise<void> {
    await userModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
  }

  public async verifyAuthorization(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const unauthorizedStatus = 401;

      let unauthorizedErrorResponse = errorResponseUtil.getErrorResponse(
        'Y',
        unauthorizedStatus,
        messages.unauthorized
      );

      let token;
      let tokenSecret;

      const refreshTokenRoutes = ['/authentication/refresh-access-token'];

      if (refreshTokenRoutes.includes(req.route.path)) {
        const refreshTokenCookieName = authenticationUtil.refreshTokenCookieName;

        token = req.cookies[refreshTokenCookieName];

        tokenSecret = environmentUtil.refreshTokenSecret;
      } else {
        const authorization = req.header('Authorization');

        // Error: Invalid Authorization header
        if (!authorization || !authorization.startsWith('Bearer ')) {
          return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
        }

        token = authorization.substring(7, authorization.length);

        const validationTokenRoutes = ['/users/:id/validate'];

        tokenSecret = validationTokenRoutes.includes(req.route.path)
          ? environmentUtil.validationTokenSecret
          : environmentUtil.accessTokenSecret;
      }

      // Error: Token undefined
      if (!token) {
        return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
      }

      let tokenPayload;

      // Error: Token validation
      try {
        tokenPayload = jwt.verify(token, tokenSecret);
      } catch (error) {
        if (error.message) {
          if (error.message === 'jwt expired') {
            unauthorizedErrorResponse = errorResponseUtil.getErrorResponse(
              'X',
              unauthorizedStatus,
              messages.unauthorized
            );
          } else {
            unauthorizedErrorResponse = errorResponseUtil.getErrorResponse(
              'W',
              unauthorizedStatus,
              messages.unauthorized
            );
          }

          unauthorizedErrorResponse.error.message = errorMessageUtil.parseErrorMessage(error.message);
        }

        return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
      }

      req.tokenPayload = tokenPayload as TokenPayload;

      // Error: Token revoked
      const user = await userModel.findOne({ _id: req.tokenPayload.id });

      if (user && !(req.tokenPayload.tokenVersion === user.tokenVersion)) {
        return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const jwtHandlerUtil = new JwtHandlerUtil();
