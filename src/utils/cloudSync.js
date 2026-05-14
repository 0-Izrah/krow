import { supabase } from './supabase';

/**
 * Syncs all local storage data to Supabase cloud
 * Called after workout completion or on manual sync
 */
export async function syncAllDataToCloud() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            console.log("ℹ️ Not logged in - skipping cloud sync");
            return false;
        }

        // Gather all relevant local data
        const allData = {};
        
        // Get all app data from localStorage (excluding internal keys)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            
            // Skip internal/Supabase keys
            if (key && !key.startsWith('__') && !key.startsWith('sb-') && value) {
                try {
                    allData[key] = JSON.parse(value);
                } catch (e) {
                    allData[key] = value;
                }
            }
        }

        if (Object.keys(allData).length === 0) {
            console.log("ℹ️ No data to sync");
            return true;
        }

        // Upsert to cloud
        const { error } = await supabase
            .from('user_sync')
            .upsert(
                {
                    user_id: session.user.id,
                    local_data: allData,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id' }
            );

        if (error) {
            console.error("❌ Cloud sync failed:", error.message);
            return false;
        }

        console.log("✅ All data synced to cloud successfully");
        return true;
    } catch (err) {
        console.error("Unexpected error during cloud sync:", err);
        return false;
    }
}

/**
 * Pulls all cloud data and syncs to local storage
 */
export async function syncCloudDataToLocal() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            console.log("ℹ️ Not logged in - cannot pull cloud data");
            return false;
        }

        const { data, error } = await supabase
            .from('user_sync')
            .select('local_data')
            .eq('user_id', session.user.id)
            .maybeSingle();

        if (error) {
            console.error("Error pulling cloud data:", error.message);
            return false;
        }

        if (data?.local_data && typeof data.local_data === 'object') {
            Object.entries(data.local_data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
            console.log("✅ Cloud data synced to local storage");
            return true;
        }

        console.log("ℹ️ No cloud data found");
        return true;
    } catch (err) {
        console.error("Unexpected error pulling cloud data:", err);
        return false;
    }
}
