import React, { createContext, useContext, useState, useCallback } from 'react';

export type Listing = {
  id: string;
  category: string;
  icon: string;
  description: string;
  createdAt: string;
};

type ListingsContextType = {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => void;
};

const ListingsContext = createContext<ListingsContextType>({
  listings: [],
  addListing: () => {},
});

export function useListings() {
  return useContext(ListingsContext);
}

const CATEGORY_ICONS: Record<string, string> = {
  'Hair & Beauty': '💇',
  'Fitness & Training': '💪',
  'Photography': '📸',
  'Tutoring & Education': '📚',
  'Home Repair': '🔧',
  'Legal & Financial Advice': '⚖️',
  'Graphic Design & Creative': '🎨',
};

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);

  const addListing = useCallback((listing: Omit<Listing, 'id' | 'createdAt'>) => {
    setListings((prev) => [
      {
        ...listing,
        icon: listing.icon || CATEGORY_ICONS[listing.category] || '🤝',
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  return (
    <ListingsContext.Provider value={{ listings, addListing }}>
      {children}
    </ListingsContext.Provider>
  );
}
