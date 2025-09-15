import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      // debugger;
      const itemIndex = state.items.findIndex(item => item.product_variant.id === action.payload.product_variant.id);

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);
    },
    clearCart: (state) => {
      state.items = [];
    },
    replaceItem: (state, action) => {
      // debugger;
      // state.items = [];
      state.items.push(action.payload);
    }
  },
});

export const { addItem, removeItem, clearCart,replaceItem } = cartSlice.actions;

export default cartSlice.reducer;
