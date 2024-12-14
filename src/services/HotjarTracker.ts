import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Define the global type for Hotjar
declare global {
  interface Window {
    hj: (...args: any[]) => void;  // Define the hj function on window
  }
}

const useHotjarTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.hj) {
      window.hj("stateChange", location.pathname); // Inform Hotjar about the route change
    }
  }, [location]); // Run this effect when the location (path) changes
};

export default useHotjarTracker;
