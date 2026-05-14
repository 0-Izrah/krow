import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export function useAuthInit() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Restore session on app initialization
        const initializeAuth = async () => {
            try {
                // Get the current session
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser(session.user);
                    console.log("✅ Session restored from storage");
                } else {
                    console.log("ℹ️ No active session found");
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth init error:", err);
                setUser(null);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("🔐 Auth state changed:", event);
                setUser(session?.user || null);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return { isInitialized, user };
}
