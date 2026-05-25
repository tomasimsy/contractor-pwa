// app/public/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicHomePage() {
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.default.init({ duration: 700, once: true, offset: 40 });
    });
  }, []);

  const sendSMS = (phone: string, message: string) => {
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-white text-[#1f2a2e] font-sans antialiased">
      {/* Your existing landing page content here */}
      {/* Copy everything from your current HomePage component */}
    </div>
  );
}