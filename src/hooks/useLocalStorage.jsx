import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // On mount, potentially fetch from cloud if we want strict sync
    // For now, we just push upwards when things change

    const setValue = async (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));

            // Sync to Supabase in the background (non-blocking)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    // Merge and sync all localStorage data as single row
                    const allData = {};
                    const keys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        const v = localStorage.getItem(k);
                        if (v && !k.startsWith('__') && !k.startsWith('sb-')) {
                            try {
                                allData[k] = JSON.parse(v);
                                keys.push(k);
                            } catch (e) {
                                allData[k] = v;
                                keys.push(k);
                            }
                        }
                    }

                    const dbPayload = {
                        user_id: user.id,
                        local_data: allData,
                        updated_at: new Date().toISOString()
                    };

                    // Try upsert without column specification to avoid 406 errors
                    const { error } = await supabase.from('user_sync').upsert(dbPayload, { onConflict: 'user_id' });
                    
                    if (error) {
                        console.warn('[Sync] Upsert error:', error.message);
                    } else {
                        console.debug(`[Sync] Synced keys: ${keys.join(', ')}`);
                    }
                } catch (syncError) {
                    // Silently fail - app still works offline
                    console.debug('Supabase sync failed (this is OK):', syncError?.message);
                }
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}