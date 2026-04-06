import { useState, useEffect } from "react";

/**
 * Custom hook to track if the component has mounted.
 * Useful for gating effects that should only run on the client or after initialization.
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
}
