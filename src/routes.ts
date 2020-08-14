import { Router } from 'express';
import CustomersController from './controllers/customers.controller';

const routes = Router();

routes.get('/customers', CustomersController.index);

export default routes;
