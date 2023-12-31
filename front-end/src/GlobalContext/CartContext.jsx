import { createContext, useContext, useEffect, useReducer } from "react";
import reducer from "../Reducers/CartReducer";

const CartContext = createContext();

//getting carts data from local storage
const getLocalStorageCartData = () => {
  let localStorageCartData = localStorage.getItem("fr-bill-cart");
  // if our first carts value empty then set empty array
  if (localStorageCartData == "undefined" || localStorageCartData === null) {
    return [];
  } else {
    return JSON.parse(localStorageCartData);
  }
};

const initialState = {
  // carts: [],
  // making a new function and set carts value
  carts: getLocalStorageCartData(),
};

// eslint-disable-next-line react/prop-types
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  //add item data inside cart

  const handleAddToBill = (item, tableName) => {
    dispatch({ type: "ADD_TO_BILL", payload: { item, tableName } });
  };

  const itemRemove = (item) => {
    dispatch({ type: "REMOVE_SINGLE_ITEM", payload: item });
  };

  const handleRemoveAllSoldCart = () => {
    dispatch({ type: "REMOVE_CART" });
  };

  //add cart data inside local storage
  useEffect(() => {
    localStorage.setItem("fr-bill-cart", JSON.stringify(state.carts));
  }, [state.carts]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        handleAddToBill,
        itemRemove,
        handleRemoveAllSoldCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCartContext = () => {
  return useContext(CartContext);
};

export { CartProvider, CartContext, useCartContext };
