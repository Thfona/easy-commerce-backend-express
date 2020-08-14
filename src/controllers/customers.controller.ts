import { Request, Response } from 'express';
import Customer from '../models/customer.model';

class CustomersController {
  public async index(req: Request, res: Response): Promise<Response> {
    const customers = await Customer.find();

    return res.json(customers);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const customer = Customer.create(req.body);

    return res.json(customer);
  }
}

export default new CustomersController();
