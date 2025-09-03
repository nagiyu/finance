'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to determine the number of graph items to display based on screen size
 * @returns number of items to display (between 10 and 30)
 */
export function useResponsiveGraphItems(): number {
  const [itemCount, setItemCount] = useState(30); // Default to maximum

  useEffect(() => {
    const updateItemCount = () => {
      const width = window.innerWidth;
      
      // Define breakpoints and corresponding item counts
      if (width < 480) {
        // Small mobile screens - fewer items to prevent overflow
        setItemCount(10);
      } else if (width < 768) {
        // Large mobile screens
        setItemCount(15);
      } else if (width < 1024) {
        // Tablet screens
        setItemCount(20);
      } else {
        // Desktop screens - full 30 items
        setItemCount(30);
      }
    };

    // Set initial value
    updateItemCount();

    // Add event listener for window resize
    window.addEventListener('resize', updateItemCount);

    // Cleanup
    return () => window.removeEventListener('resize', updateItemCount);
  }, []);

  return itemCount;
}