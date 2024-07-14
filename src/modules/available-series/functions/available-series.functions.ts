import { AvailableSeries } from '../models/available-series.models';

export const getBasicCarsFiltersSeries = (
  availableSeries: AvailableSeries | null
): { mainSerie: string[]; exclusiveSerie: string[] } => {
  return {
    mainSerie: availableSeries?.series ? availableSeries.series.split(',') : [],
    exclusiveSerie:
      availableSeries && availableSeries.exclusive_series
        ? availableSeries.exclusive_series.split(',')
        : [],
  };
};
