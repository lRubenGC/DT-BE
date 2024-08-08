export enum USER_PROPERTY {
  OWNED = 'owned',
  WISHED = 'wished',
  NOT_OWNED = 'not_owned',
}

export const AVAILABLE_USER_PROPERTY_FILTERS: USER_PROPERTY[] = [
  USER_PROPERTY.OWNED,
  USER_PROPERTY.WISHED,
  USER_PROPERTY.NOT_OWNED,
];

export type CAR_TYPE = 'basic' | 'premium' | 'special';
