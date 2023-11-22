const CartReducer = (state, action) => {
  if (action.type === "ADD_TO_BILL") {
    let { item, tableName } = action.payload;

    // Check if the item already exists in the cart
    const existingCartItemIndex = state.carts.findIndex(
      (cartItem) =>
        cartItem._id === item._id && cartItem.table_name === tableName
    );

    if (existingCartItemIndex !== -1) {
      // If the item already exists, update its quantity
      const updatedCarts = [...state.carts];
      updatedCarts[existingCartItemIndex].item_quantity += 1;

      return {
        ...state,
        carts: updatedCarts,
      };
    } else {
      // If the item doesn't exist, add it to the cart
      let cartItem = {
        _id: item._id,
        item_name: item.item_name,
        item_price_per_unit: item.item_price,
        item_quantity: 1,
        table_name: tableName,
      };

      return {
        ...state,
        carts: [...state.carts, cartItem],
      };
    }
  }
  if (action.type === "REMOVE_SINGLE_ITEM") {
    let updatedCart = state?.carts?.filter(
      (currentItem) => currentItem?._id !== action?.payload?._id
    );
    return {
      ...state,
      carts: updatedCart,
    };
  }
  //   if (action.type === "ITEM_QUANTITY_CHANGE") {
  //     const { _id } = action.payload;

  //     // Check if the item exists in the cart
  //     const existingCartItemIndex = state?.carts?.findIndex(
  //       (currentItem) => currentItem?._id === _id
  //     );

  //     if (existingCartItemIndex !== -1) {
  //       // If the item exists, you can update its quantity or other properties here
  //       // For example, updating the quantity to a specific value (e.g., 0 to remove)
  //       // You can replace this with your desired logic for updating other properties.
  //       let updatedCarts = [...state.carts];
  //       updatedCarts[existingCartItemIndex] = {
  //         ...updatedCarts[existingCartItemIndex],
  //         item_quantity: 0,
  //       };

  //       return {
  //         ...state,
  //         carts: updatedCarts,
  //       };
  //     }

  //     // If the item is not found, just return the current state
  //     return state;
  //   }

  return state;
};

export default CartReducer;
