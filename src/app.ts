import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import routesV1 from './routes-v1';
import Environment from './utils/environment.util';
import { ErrorInterface } from './interfaces/error.interface';

class App {
  public express: Application;

  public constructor() {
    this.express = express();

    this.initializeMiddlewares();
    this.initializeDatabaseConnection();
    this.initializeRoutes();
    this.initializeErrorHandler();
  }

  private initializeMiddlewares(): void {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());

    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 500,
      delayMs: 10
    });

    this.express.use(speedLimiter);

    const rateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000
    });

    this.express.use(rateLimiter);
  }

  private initializeDatabaseConnection(): void {
    this.connectDatabase();

    mongoose.connection.on('disconnected', this.connectDatabase);
  }

  private initializeRoutes(): void {
    this.express.use('/api/v1', routesV1);
  }

  private initializeErrorHandler(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.express.use((err: ErrorInterface, req: Request, res: Response, next: NextFunction) => {
      const isDev: boolean = Environment.isProduction;

      if (!err.status) {
        err.status = 500;
      }

      if (isDev) {
        console.log('\nError:', err);
      }

      if (err.redirect) {
        res.status(404).send({ status: 404, message: err.message, redirect: err.redirect });
      } else {
        res.status(err.status).send({ status: err.status, message: err.message });
      }
    });
  }

  private connectDatabase(): void {
    const db = process.env.DB_HOST || 'mongodb://localhost:27017/easyCommerceDB';

    mongoose
      .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
      .then(() => {
        return console.info(`Successfully connected to ${db}`);
      })
      .catch((error: any) => {
        console.error(`Error connecting to database: ${error}`);

        return process.exit(1);
      });
  }
}

export default new App().express;
