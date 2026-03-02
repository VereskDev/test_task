import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

export type CartProduct = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedPrice: number;
};

export type Cart = {
  id: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
};

export type CartsListResponse = {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
};

export type FetchCartsParams = {
  limit: number;
  skip: number;
  userId?: number;
};

export const fetchCarts = async (params: FetchCartsParams): Promise<CartsListResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set('limit', String(params.limit));
  searchParams.set('skip', String(params.skip));
  if (params.userId !== undefined) {
    searchParams.set('userId', String(params.userId));
  }

  const { data } = await api.get<CartsListResponse>(`/carts?${searchParams.toString()}`);
  return data;
};

export const fetchCart = async (id: number): Promise<Cart> => {
  const { data } = await api.get<Cart>(`/carts/${id}`);
  return data;
};

export type UpdateCartPayloadProduct = {
  id: number;
  quantity: number;
};

export type UpdateCartPayload = {
  merge: boolean;
  products: UpdateCartPayloadProduct[];
};

export const updateCart = async (id: number, payload: UpdateCartPayload): Promise<Cart> => {
  const { data } = await api.put<Cart>(`/carts/${id}`, payload);
  return data;
};

