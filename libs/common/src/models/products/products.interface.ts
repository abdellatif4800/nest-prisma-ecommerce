export interface productsFiltersParams {
  minPrice?: number;
  maxPrice?: number;
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
