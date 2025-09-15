import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import cartReducer from './cartSlice';
import favouritesReducer from './favouriteSlice';

const rootReducer = combineReducers({
  cart: cartReducer,
  favourites: favouritesReducer,
});

export const store = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

export default store;
