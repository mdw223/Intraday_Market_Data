import { http } from './httpClient';
import type { MonthlyStockData } from '../../api/src/types/types';

export const ApiClient = {
  getStockData: (symbol: string) =>
    http.get<MonthlyStockData>(`/stocks/${symbol}`),
};