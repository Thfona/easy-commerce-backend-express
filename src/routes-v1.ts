import { Router } from 'express';
import UsersController from './controllers/users.controller';

const routesV1 = Router();

routesV1.get('/users', UsersController.indexV1);
routesV1.post('/users', UsersController.createV1);

export default routesV1;
