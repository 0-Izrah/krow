import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabase";

export function useWorkoutLogs() {
    const [logs, setLogs] = useLocalStorage("grind_logs", []);

const logWorkout = async ({ routineId, routineName, completedExercises, duration, calories }) => {
        const newLog = {
            id: uuidv4(),
            routineId,
            routineName,
            completedExercises,
            date: new Date().toISOString(),
            duration: duration || 0,
            calories: calories || 0,
        };
        
        // 1. Calculate the new state BEFORE saving to local state
        const updatedLogs = [newLog, ...logs];

        // 2. Save locally IMMEDIATELY
        setLogs(updatedLogs);

        // 3. Fire-and-forget Background Cloud Sync
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                // A. Fetch existing cloud data. Using .maybeSingle() prevents 406 errors on new users!
                const { data: existingRecord } = await supabase
                    .from('user_sync')
                    .select('local_data')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                const currentLocalData = existingRecord?.local_data || {};
                
                // B. Update just the logs portion of the JSONB
                currentLocalData.grind_logs = updatedLogs;

                // C. Upsert the data
                const { error } = await supabase
                    .from('user_sync')
                    .upsert({ 
                        user_id: session.user.id,
                        local_data: currentLocalData,
                        updated_at: new Date().toISOString()
                    }, { 
                        onConflict: 'user_id' 
                    });

                if (error) {
                    console.error("Cloud sync failed:", error.message);
                } else {
                    console.log("✅ Backup successfully synced to user_sync.");
                }
            }
        } catch (err) {
            console.error("Unexpected error during cloud sync:", err);
        }

        return newLog;
    };

    const getLogsByDateRange = (startDate, endDate) => {
        return logs.filter((log) => {
            const logDate = new Date(log.date);
            return logDate >= startDate && logDate <= endDate;
        });
    };

    const getLogsThisWeek = () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return getLogsByDateRange(startOfWeek, now);
    };

    const deleteLog = async (id) => {
        const updatedLogs = logs.filter((l) => l.id !== id);
        
        // Update local UI immediately
        setLogs(updatedLogs);

        // Mirror the deletion to the cloud
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: existingRecord } = await supabase
                    .from('user_sync')
                    .select('local_data')
                    .eq('user_id', session.user.id)
                    .maybeSingle(); // Changed to maybeSingle() here too

                const currentLocalData = existingRecord?.local_data || {};
                currentLocalData.grind_logs = updatedLogs;

                await supabase.from('user_sync').upsert({
                    user_id: session.user.id,
                    local_data: currentLocalData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            }
        } catch(err) {
            console.error("Failed to sync deletion to cloud:", err);
        }
    };

    return { logs, logWorkout, getLogsThisWeek, getLogsByDateRange, deleteLog };
}