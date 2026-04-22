import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const normalizeWishlistProducts = (payload) => {
  if (Array.isArray(payload?.wishlist?.products)) return payload.wishlist.products;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
};

export const WishlistProvider = ({ children }) => {
  const { auth } = useAuth();
  const user = auth?.user;
  const isWishlistUser = user?.role === 'user';

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const syncWishlistState = (products) => {
    setWishlistProducts(products);
    window.dispatchEvent(new Event('wishlist:updated'));
  };

  const refreshWishlist = async () => {
    if (!isWishlistUser) {
      syncWishlistState([]);
      return [];
    }

    try {
      setLoading(true);
      const res = await axiosClient.get('/api/wishlist');
      const products = normalizeWishlistProducts(res.data);
      syncWishlistState(products);
      return products;
    } catch (error) {
      console.error('Wishlist refresh error:', error);
      syncWishlistState([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWishlistUser) {
      refreshWishlist();
    } else {
      syncWishlistState([]);
    }
  }, [user?._id, user?.role]);

  const updateWishlistFromResponse = (data) => {
    const products = normalizeWishlistProducts(data);
    syncWishlistState(products);
    return products;
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      return { ok: false, requiresLogin: true, message: 'Please login to use wishlist' };
    }
    if (!isWishlistUser) {
      return { ok: false, forbidden: true, message: 'Wishlist is available for customers only' };
    }

    const res = await axiosClient.post('/api/wishlist/add', { productId });
    updateWishlistFromResponse(res.data);
    return { ok: true, wishlisted: true, message: res.data?.message || 'Added to wishlist' };
  };

  const removeFromWishlist = async (productId) => {
    if (!user) {
      return { ok: false, requiresLogin: true, message: 'Please login to use wishlist' };
    }
    if (!isWishlistUser) {
      return { ok: false, forbidden: true, message: 'Wishlist is available for customers only' };
    }

    const res = await axiosClient.post('/api/wishlist/remove', { productId });
    updateWishlistFromResponse(res.data);
    return { ok: true, wishlisted: false, message: res.data?.message || 'Removed from wishlist' };
  };

  const wishlistIds = wishlistProducts.map((product) => product?._id).filter(Boolean);

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  const toggleWishlist = async (productId) => {
    if (isWishlisted(productId)) {
      return removeFromWishlist(productId);
    }
    return addToWishlist(productId);
  };

  const value = useMemo(
    () => ({
      wishlistProducts,
      wishlistIds,
      wishlistCount: wishlistIds.length,
      loading,
      refreshWishlist,
      isWishlisted,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }),
    [wishlistProducts, wishlistIds, loading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
