import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRATION,
  JWT_COOKIE_PROPS,
  REFRESH_TOKEN,
} from '../modules/auth/models/auth.constants';
import { getToken } from '../modules/auth/models/auth.functions';
import { AUTH_ROUTE, authRouter } from '../modules/auth/routes/auth.routes';
import {
  BASIC_CARS_ROUTE,
  basicCarsRouter,
} from '../modules/cars-basic/routes/basic-cars.routes';
import {
  PREMIUM_CARS_ROUTE,
  premiumCarsRouter,
} from '../modules/cars-premium/routes/premium-cars.routes';
import {
  SPECIAL_CARS_ROUTE,
  specialCarsRouter,
} from '../modules/cars-special/routes/special-cars.routes';
import { SEARCH_ROUTE, searchRouter } from '../modules/search/routes/search.routes';
import { USERS_ROUTE, usersRouter } from '../modules/users/routes/users.routes';
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
      this.setUserInSession(req, res, next)
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

  private setUserInSession(req: Request, res: Response, next: NextFunction) {
    req.session = { user: null };
    const accessToken = req.cookies[ACCESS_TOKEN];
    const refreshToken = req.cookies[REFRESH_TOKEN];
    if (!accessToken && !refreshToken) return next();

    try {
      const user = jwt.verify(accessToken, process.env.SECRETORPRIVATEKEY);
      req.session.user = user;
      return next();
    } catch (err) {
      try {
        const user = jwt.verify(refreshToken, process.env.SECRETORPRIVATEKEY);
        const newAccessToken = getToken(user, ACCESS_TOKEN_EXPIRATION);
        res.cookie(ACCESS_TOKEN, newAccessToken, JWT_COOKIE_PROPS);
        req.session.user = user;
      } catch (error) {}
    }
    next();
  }

  private routes() {
    this.app.use(AUTH_ROUTE, authRouter);
    this.app.use(BASIC_CARS_ROUTE, basicCarsRouter);
    this.app.use(PREMIUM_CARS_ROUTE, premiumCarsRouter);
    this.app.use(SEARCH_ROUTE, searchRouter);
    this.app.use(SPECIAL_CARS_ROUTE, specialCarsRouter);
    this.app.use(USERS_ROUTE, usersRouter);
  }

  public listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running in port ${this.PORT}`);
    });
  }
}
