// hooks/useRealtimeEstimates.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';

export function useRealTimeEstimates() {
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'estimates' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
            toast.custom(
              (t) => (
                <div className="bg-white rounded-lg shadow-lg border-l-4 border-emerald-500 p-3 flex items-center justify-between gap-3 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">✍️</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Estimate Signed!</p>
                      <p className="text-xs text-gray-500">#{payload.new.estimate_number}</p>
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}