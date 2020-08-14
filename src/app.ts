import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes';

class App {
  public express: Application;

  public constructor() {
    this.express = express();

    this.startMiddlewares();
    this.startDatabase();
    this.startRoutes();
  }

  private startMiddlewares(): void {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());
  }

  private startDatabase(): void {
    this.connectDatabase();

    mongoose.connection.on('disconnected', this.connectDatabase);
  }

  private startRoutes(): void {
    this.express.use(routes);
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
