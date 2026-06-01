// components/PollingNotification.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import toast, { Toaster } from "react-hot-toast";

export default function PollingNotification() {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    // Poll every 10 seconds
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select('id, estimate_number, status, updated_at')
        .gte('updated_at', lastChecked.toISOString())
        .eq('status', 'approved');

      if (!error && data && data.length > 0) {
        data.forEach(estimate => {
          // Custom toast that never auto‑dismisses, with a close button
          toast.custom(
            (t) => (
              <div className="bg-white rounded-lg shadow-lg border-l-4 border-emerald-500 p-3 flex items-center justify-between gap-3 min-w-[280px]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✍️</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Estimate Signed!</p>
                    <p className="text-xs text-gray-500">#{estimate.estimate_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              </div>
            ),
            { duration: Infinity, position: 'top-right' }
          );
        });
        setLastChecked(new Date());
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastChecked]);

  return <Toaster position="top-right" />;
}