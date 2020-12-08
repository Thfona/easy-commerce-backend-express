import { Router } from 'express';
import { authenticationController } from './controllers/authentication.controller';
import { usersController } from './controllers/users.controller';
import { jwtHandlerUtil } from './utils/jwt-handler.util';

const routesV1 = Router();

const authenticationPath = '/authentication';

// Authentication
routesV1.post(`${authenticationPath}/login`, authenticationController.loginV1);
routesV1.post(
  `${authenticationPath}/refresh-access-token`,
  jwtHandlerUtil.verifyAuthorization,
  authenticationController.refreshAccessTokenV1
);
routesV1.post(`${authenticationPath}/logout`, authenticationController.logoutV1);

// Users
routesV1.get('/users', jwtHandlerUtil.verifyAuthorization, usersController.getV1);
routesV1.get('/users/:id', jwtHandlerUtil.verifyAuthorization, usersController.getByIdV1);
routesV1.post('/users', usersController.registerV1);
routesV1.post('/users/:id/validate', jwtHandlerUtil.verifyAuthorization, usersController.validateV1);
routesV1.post('/users/generate-new-validation-token', usersController.generateNewValidationTokenV1);
routesV1.post('/users/:id/revoke-sessions', jwtHandlerUtil.verifyAuthorization, usersController.revokeSessionsV1);

export const apiRoutesV1 = routesV1;
