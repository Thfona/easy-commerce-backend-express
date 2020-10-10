import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

class UsersController {
  public async indexV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const users = await User.find({ active: true });

      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  public async createV1(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.json({
          status: 200,
          message: 'User successfully created.'
        });
      }

      await User.create({ ...req.body, active: true });

      return res.json({
        status: 200,
        message: 'User successfully created.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
