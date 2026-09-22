import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/api';

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    wishlistService.getWishlistIds().then(setWishlistIds);
  }, []);

  const isWishlisted = (id: string) => wishlistIds.includes(id);

  const toggleWishlist = async (id: string) => {
    const updated = await wishlistService.toggleWishlist(id);
    setWishlistIds(updated);
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, count: wishlistIds.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
