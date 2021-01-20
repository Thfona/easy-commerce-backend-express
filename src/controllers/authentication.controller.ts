import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { authenticationUtil } from '../utils/authentication.util';
import { errorResponseUtil } from '../utils/error-response.util';
import { jwtHandlerUtil } from '../utils/jwt-handler.util';
import { validatorUtil } from '../utils/validator.util';
import { userModel } from '../models/user.model';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { messages } from '../constants/messages.constant';

class AuthenticationController {
  public async loginV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const { error, parsedErrorMessage } = validatorUtil.validate('login', req.body);

      // Error: Request body validation
      if (error) {
        const status = 400;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, parsedErrorMessage);

        return res.status(status).json(errorResponse);
      }

      const user = await userModel.findOne({ email: req.body.email });

      const unauthorizedStatus = 401;

      const unauthorizedErrorResponse = errorResponseUtil.getErrorResponse(
        'A',
        unauthorizedStatus,
        messages.unauthorizedLogin
      );

      // Error: Invalid user
      if (!user) {
        return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
      }

      const isValidPassword = await bcrypt.compare(req.body.password, user.password);

      // Error: Invalid password
      if (!isValidPassword) {
        return res.status(unauthorizedStatus).json(unauthorizedErrorResponse);
      }

      const forbiddenStatus = 403;

      // Error: Unvalidated user
      if (!user.validated) {
        const errorResponse = errorResponseUtil.getErrorResponse('A', forbiddenStatus, messages.unvalidatedLogin);

        return res.status(forbiddenStatus).json(errorResponse);
      }

      // Error: Inactive user
      if (!user.active) {
        const errorResponse = errorResponseUtil.getErrorResponse('B', forbiddenStatus, messages.inactiveLogin);

        return res.status(forbiddenStatus).json(errorResponse);
      }

      const tokenPayload: TokenPayload = {
        id: user._id,
        email: user.email,
        name: {
          first: user.name.first,
          last: user.name.last
        },
        tokenVersion: user.tokenVersion
      };

      const accessToken = jwtHandlerUtil.signAccessToken(tokenPayload);

      const refreshToken = jwtHandlerUtil.signRefreshToken(tokenPayload);

      res.setHeader(
        'Set-Cookie',
        authenticationUtil.getRefreshTokenCookieString(refreshToken, req.body.persistSession)
      );

      // Success: Access token is returned
      return res.status(200).json({
        accessToken: accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  public async refreshAccessTokenV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const user = await userModel.findOne({ _id: req.tokenPayload.id });

      // Error: Invalid token
      if (!user) {
        const status = 401;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.unauthorized);

        return res.status(status).json(errorResponse);
      }

      const tokenPayload: TokenPayload = {
        id: user._id,
        email: user.email,
        name: {
          first: user.name.first,
          last: user.name.last
        },
        tokenVersion: user.tokenVersion
      };

      const accessToken = jwtHandlerUtil.signAccessToken(tokenPayload!);

      const refreshToken = jwtHandlerUtil.signRefreshToken(tokenPayload!);

      res.setHeader(
        'Set-Cookie',
        authenticationUtil.getRefreshTokenCookieString(refreshToken, req.body.persistSession)
      );

      // Success: Access token is returned
      return res.status(200).json({
        accessToken: accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  public async logoutV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      res.setHeader('Set-Cookie', authenticationUtil.getRemoveRefreshTokenCookieString());

      // Success: No content is returned
      return res.status(204).json();
    } catch (error) {
      next(error);
    }
  }
}

export const authenticationController = new AuthenticationController();
