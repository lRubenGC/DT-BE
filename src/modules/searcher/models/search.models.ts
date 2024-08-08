import { CAR_TYPE, USER_PROPERTY } from '../../../shared/models/cars.models';
import { ORDER } from '../../../shared/models/filters.models';

export interface SearchCarPayload {
  query: string;
  carType?: CAR_TYPE | null;
  order?: ORDER | null;
  userProperty?: USER_PROPERTY | null;
}
