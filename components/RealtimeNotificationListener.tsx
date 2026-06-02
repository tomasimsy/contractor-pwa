"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNotifications } from "@/context/NotificationContext";

export default function RealtimeNotificationListener() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    console.log("🚀 Setting up real‑time listener...");
    const channel = supabase
      .channel('realtime-estimates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'estimates' },
        (payload) => {
          console.log("🔥 Realtime event received:", payload);
          addNotification(
            'Estimate Signed',
            `Estimate #${payload.new.estimate_number} was signed.`
          );
        }
      )
      .subscribe((status) => {
        console.log("📡 Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  return null;
}