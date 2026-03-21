/**
 * Central API exports
 * Import API services from here for consistency
 */

// Axios instances
export { clientApi, getErrorMessage, serverApi } from "./axios";

// Product APIs
export { productClientApi, productServerApi } from "./products";
export type { IProductClientFilter, IProductFilter } from "./products";

// Category APIs
export { categoryClientApi, categoryServerApi } from "./categories";

// Auth API
export { authApi } from "./auth";
export type { AuthTokens, LoginCredentials, RegisterData, User } from "./auth";

// Cart API
export { cartApi } from "./cart";
export type { AddToCartData, Cart, CartItem, UpdateCartItemData } from "./cart";

// Order APIs
export { orderClientApi } from "./orders";

// Review APIs
export { reviewClientApi, reviewServerApi } from "./reviews";

// Store APIs (site config, banners)
export { storeClientApi, storeServerApi } from "./store";

// Wishlist APIs
export { wishlistClientApi } from "./wishlists";
