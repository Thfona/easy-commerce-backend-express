import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { environmentUtil } from './environment.util';
import { adminModel } from '../models/admin.model';
import { userModel } from '../models/user.model';
import { ErrorResponseInterface } from '../interfaces/error-response.interface';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { errorMessageUtil } from './error-message.util';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { role } from '../types/role.type';
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

  public validateTokenRole(role: role, payload: TokenPayload): boolean {
    return role === payload.role;
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

      const unauthorizedErrorResponse: ErrorResponseInterface = {
        error: {
          status: unauthorizedStatus,
          code: unauthorizedStatus.toString().concat('Y'),
          message: messages.unauthorized
        }
      };

      let token;
      let tokenSecret;

      const refreshTokenRoutes = ['/authentication/refresh-access-token'];

      if (refreshTokenRoutes.includes(req.route.path)) {
        token = req.cookies.refreshToken;

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
            unauthorizedErrorResponse.error.code = unauthorizedStatus.toString().concat('X');
          } else {
            unauthorizedErrorResponse.error.code = unauthorizedStatus.toString().concat('W');
          }

          unauthorizedErrorResponse.error.message = errorMessageUtil.parseErrorMessage(error.message);
        }

        return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
      }

      req.tokenPayload = tokenPayload as TokenPayload;

      // Error: Token revoked (user)
      if (req.tokenPayload.role === 'user') {
        const user = await userModel.findOne({ _id: req.tokenPayload.id });

        if (user && !(req.tokenPayload.tokenVersion === user.tokenVersion)) {
          return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
        }
      }

      // Error: Token revoked (admin)
      if (req.tokenPayload.role === 'admin') {
        const admin = await adminModel.findOne({ _id: req.tokenPayload.id });

        if (admin && !(req.tokenPayload.tokenVersion === admin.tokenVersion)) {
          return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const jwtHandlerUtil = new JwtHandlerUtil();
