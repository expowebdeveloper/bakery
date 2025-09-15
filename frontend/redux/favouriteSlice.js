import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favourites: [],
};

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addFavourite: (state, action) => {
      const isAlreadyFavourite = state.favourites.some(item => item.id === action.payload.id);
      if (!isAlreadyFavourite) {
        state.favourites.push(action.payload);
      }
    },
    removeFavourite: (state, action) => {
      state.favourites = state.favourites.filter(item => item.id !== action.payload.id);
    },
    clearFavourites: (state) => {
      state.favourites = [];
    },
    setFavourites: (state, action) => {
      state.favourites = action.payload;
    },
  },
});

export const { addFavourite, removeFavourite, clearFavourites,setFavourites } = favouritesSlice.actions;

export default favouritesSlice.reducer;
