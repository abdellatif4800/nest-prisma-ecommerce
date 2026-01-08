export interface OrdersFiltersParams {
  id?: string;
  userId?: string;

  status?: string;
  paymentMethod?: string;

  createdAt?: string;

  startDate?: string;
  endDate?: string;

  minTotal?: number;
  maxTotal?: number;
}
