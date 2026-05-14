import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export function useAutoSync() {
    useEffect(() => {
        const pullFromCloud = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            try {
                const { data, error } = await supabase
                    .from('user_sync')
                    .select('local_data')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                if (error || !data || !data.local_data) return;

                let hasChanges = false;
                const syncData = data.local_data;

                Object.entries(syncData).forEach(([k, v]) => {
                    // NEVER pull down the auth tokens
                    if (!k.startsWith('sb-') && !k.startsWith('__')) {
                        const stringifiedValue = JSON.stringify(v);
                        
                        // Only overwrite if the cloud data is actually different
                        if (localStorage.getItem(k) !== stringifiedValue) {
                            localStorage.setItem(k, stringifiedValue);
                            hasChanges = true;
                        }
                    }
                });

                // If we updated local storage, trigger a storage event so React updates instantly without a hard refresh
                if (hasChanges) {
                    window.dispatchEvent(new Event('storage'));
                    console.log("☁️ Auto-sync complete: Device updated from cloud.");
                }
            } catch (err) {
                console.error("Background sync failed:", err);
            }
        };

        // 1. Run the sync once when the app starts or is refreshed
        pullFromCloud();

        // 2. Also run it if the user manually logs in on the settings page
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                pullFromCloud();
            }
        });

        return () => subscription.unsubscribe();
    }, []);
}