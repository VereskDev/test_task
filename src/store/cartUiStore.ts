import { create } from 'zustand';
import type { Cart } from '../api/carts';

export type CartsFilterState = {
  page: number;
  limit: number;
  userIdFilter: string;
};

type CartsFilterActions = {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setUserIdFilter: (value: string) => void;
};

type CartsFilterStore = CartsFilterState & CartsFilterActions;

export const useCartsFilterStore = create<CartsFilterStore>((set) => ({
  page: 1,
  limit: 10,
  userIdFilter: '',
  setPage: (page) => set({ page }),
  setLimit: (limit) =>
    set((state) => ({
      limit,
      page: 1,
      userIdFilter: state.userIdFilter
    })),
  setUserIdFilter: (userIdFilter) =>
    set({
      userIdFilter,
      page: 1
    })
}));

type CartOverridesState = {
  overrides: Record<number, Cart>;
};

type CartOverridesActions = {
  setOverride: (id: number, cart: Cart) => void;
  clearOverride: (id: number) => void;
};

type CartOverridesStore = CartOverridesState & CartOverridesActions;

export const useCartOverridesStore = create<CartOverridesStore>((set) => ({
  overrides: {},
  setOverride: (id, cart) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [id]: cart
      }
    })),
  clearOverride: (id) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.overrides;
      return { overrides: rest };
    })
}));

