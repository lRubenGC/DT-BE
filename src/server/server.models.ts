import cors from 'cors';
import express, { Application } from 'express';
import { SEQUELIZE } from './server.constants';
import {
  BASIC_CARS_ROUTE,
  basicCarsRouter,
} from '../modules/cars-basic/routes/basic-cars.routes';

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

  private routes() {
    this.app.use(BASIC_CARS_ROUTE, basicCarsRouter);
  }

  public listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running in port ${this.PORT}`);
    });
  }
}