export interface productsFiltersParams {
  minPrice?: number;
  maxPrice?: number;

  minRate?: number;
  maxRate?: number;

  minDiscount?: number;
  maxDiscount?: number;

  // pagination
  page?: number; // for offset-based
  limit?: number;
  cursor?: string;

  subCategory?: string;
  search?: string;
  publish?: boolean;
  id?: string;
}

export interface productsVariantsFiltersParams {
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  color?: string;
  productId?: string;
  id?: string;
  size?: string;
}
