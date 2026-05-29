"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TAB_ORDER = [
  "/dashboard", // Index 0
  "/estimates", // Index 1
  "/invoices",  // Index 2
  "/clients",   // Index 3
  "/settings"   // Index 4
];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Set a safe initial default state
  const [initialX, setInitialX] = useState("100%");

  useEffect(() => {
    // 1. Find the current tab index
    const currentIndex = TAB_ORDER.indexOf(pathname);

    // 2. Safely grab what the old index was directly from sessionStorage
    const savedIndexRaw = sessionStorage.getItem("pwa_nav_current_idx");
    const previousIndex = savedIndexRaw ? parseInt(savedIndexRaw, 10) : 0;

    if (currentIndex !== -1) {
      if (currentIndex < previousIndex) {
        // Going BACKWARD (e.g., Estimates [1] -> Home [0]) -> Slide Left-to-Right
        setInitialX("-100%");
      } else {
        // Going FORWARD (e.g., Home [0] -> Estimates [1]) -> Slide Right-to-Left
        setInitialX("100%");
      }

      // 3. Update the storage registry for the next tap event
      sessionStorage.setItem("pwa_nav_current_idx", currentIndex.toString());
    }
  }, [pathname]);

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative bg-white">
      <motion.div
        key={pathname} // Crucial: forces Framer to animate every time the path changes
        initial={{ x: initialX, opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 38, // Fast, premium native mobile application snap
        }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}