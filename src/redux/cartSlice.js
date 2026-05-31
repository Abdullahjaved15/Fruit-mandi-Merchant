import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: JSON.parse(localStorage.getItem('cart_items')) || [],
    isOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            const stock = action.payload.stock || 0;
            const addQty = action.payload.quantity || 1;
            
            if (existingItem) {
                if (existingItem.quantity + addQty <= stock) {
                    existingItem.quantity += addQty;
                } else {
                    existingItem.quantity = stock;
                }
            } else {
                if (stock > 0) {
                    state.items.push({ ...action.payload, quantity: Math.min(addQty, stock) });
                }
            }
            localStorage.setItem('cart_items', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            localStorage.setItem('cart_items', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item) {
                const stock = item.stock || Infinity;
                item.quantity = Math.max(1, Math.min(quantity, stock));
            }
            localStorage.setItem('cart_items', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cart_items');
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        }
    },
});

export const { 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    toggleCart, 
    openCart, 
    closeCart 
} = cartSlice.actions;
export default cartSlice.reducer;
