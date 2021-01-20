import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { errorResponseUtil } from '../utils/error-response.util';
import { jwtHandlerUtil } from '../utils/jwt-handler.util';
import { validatorUtil } from '../utils/validator.util';
import { userModel } from '../models/user.model';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { messages } from '../constants/messages.constant';

class UsersController {
  public async getByIdV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const user = await userModel.findOne({ _id: req.params.id });

      // Error: Invalid user
      if (!user) {
        const status = 404;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.unauthorized);

        return res.status(status).json(errorResponse);
      }

      const hasAccess = req.tokenPayload.id === user._id.toString();

      // Error: Invalid token for user
      if (!hasAccess) {
        const status = 403;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.forbidden);

        return res.status(status).json(errorResponse);
      }

      const userData = {
        name: {
          first: user.name.first,
          last: user.name.last
        },
        email: user.email,
        active: user.active,
        validated: user.validated
      };

      // Success: User data is returned
      return res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  }

  public async registerV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const { error, parsedErrorMessage } = validatorUtil.validate('user', req.body);

      // Error: Request body validation
      if (error) {
        const status = 400;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, parsedErrorMessage);

        return res.status(status).json(errorResponse);
      }

      const user = await userModel.findOne({ email: req.body.email });

      const successStatus = 201;

      // Success: Returns user created even if it already exists
      if (user) {
        return res.status(successStatus).json({
          email: user.email
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const userInfo = {
        name: {
          first: req.body.name.first,
          last: req.body.name.last
        },
        email: req.body.email
      };

      const newUser = new userModel({
        ...userInfo,
        password: hashedPassword,
        active: true,
        validated: false,
        validationToken: ''
      });

      await userModel.create(newUser);

      const createdUser = await userModel.findOne({ email: newUser.email });

      const validationToken = jwtHandlerUtil.signValidationToken({
        ...userInfo,
        id: createdUser!._id,
        tokenVersion: createdUser!.tokenVersion
      });

      await userModel.updateOne({ email: newUser.email }, { validationToken: validationToken });

      // Success: Returns user created
      return res.status(successStatus).json({
        email: newUser.email
      });
    } catch (error) {
      next(error);
    }
  }

  public async validateV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const user = await userModel.findOne({ _id: req.params.id });

      // Error: Invalid user id
      if (!user) {
        const status = 404;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.notFound);

        return res.status(status).json(errorResponse);
      }

      if (user.validated) {
        const status = 422;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.userAlreadyValidated);

        return res.status(status).json(errorResponse);
      }

      const authorizationHeader = req.header('Authorization');
      const token = authorizationHeader!.substring(7, authorizationHeader!.length);

      const hasAccess = req.tokenPayload.id === user._id.toString() && token === user.validationToken;

      // Error: Token validation
      if (!hasAccess) {
        const status = 403;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.forbidden);

        return res.status(status).json(errorResponse);
      }

      await userModel.updateOne({ _id: req.params.id }, { validated: true, validationToken: '' });

      // Success: No content is returned
      return res.status(204).json();
    } catch (error) {
      next(error);
    }
  }

  public async generateNewValidationTokenV1(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> {
    try {
      const { error, parsedErrorMessage } = validatorUtil.validate('setNewValidationToken', req.body);

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

      // Error: User has already been validated
      if (user.validated) {
        const status = 422;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.userAlreadyValidated);

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

      const validationToken = jwtHandlerUtil.signValidationToken(tokenPayload);

      await userModel.updateOne({ email: req.body.email }, { validationToken: validationToken });

      // Success: No content is returned
      return res.status(204).json();
    } catch (error) {
      next(error);
    }
  }

  public async revokeSessionsV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const user = await userModel.findOne({ _id: req.params.id });

      // Error: Invalid user id
      if (!user) {
        const status = 404;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.notFound);

        return res.status(status).json(errorResponse);
      }

      const hasAccess = req.tokenPayload.id === user._id.toString();

      // Error: Token validation
      if (!hasAccess) {
        const status = 403;

        const errorResponse = errorResponseUtil.getErrorResponse('A', status, messages.forbidden);

        return res.status(status).json(errorResponse);
      }

      await jwtHandlerUtil.revokeUserTokens(user._id);

      // Success: No content is returned
      return res.status(204).json();
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
