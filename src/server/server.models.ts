import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { AUTH_ROUTE, authRouter } from '../modules/auth/routes/auth.routes';
import {
  BASIC_CARS_ROUTE,
  basicCarsRouter,
} from '../modules/cars-basic/routes/basic-cars.routes';
import { SEQUELIZE } from './server.constants';
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

export class Server {
  private app: Application = express();
  private readonly PORT: string = process.env.PORT!;

  constructor() {
    this.databaseConnection();
    this.middlewares();
    this.routes();
  }

  private async databaseConnection() {
    try {
      await SEQUELIZE.authenticate();
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private middlewares() {
    // CORS
    this.app.use(cors());
    // Lectura del body
    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(express.urlencoded({ limit: '2mb', extended: true }));
    // Cookies - JWT
    this.app.use(cookieParser());
    this.app.use((req: Request, res: Response, next: NextFunction) =>
      this.setUserInSession(req, next)
    );
    // Carpeta pública
    this.app.use(express.static('src/public'));
    // TODO: (Mirar esto) Fileupload - Carga de archivos
    // this.app.use(
    //   fileUpload({
    //     createParentPath: true,
    //     limits: {
    //       fileSize: 2 * 1024 * 1024,
    //     },
    //   })
    // );
  }

  private setUserInSession(req: Request, next: NextFunction) {
    {
      const token = req.cookies.access_token;
      req.session = { user: null };
      try {
        const data = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        req.session.user = data;
      } catch {}
      next();
    }
  }

  private routes() {
    this.app.use(AUTH_ROUTE, authRouter);
    this.app.use(BASIC_CARS_ROUTE, basicCarsRouter);
  }

  public listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running in port ${this.PORT}`);
    });
  }
}
