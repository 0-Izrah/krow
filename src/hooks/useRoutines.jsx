import { useLocalStorage } from "./useLocalStorage";
import {v4 as uuidv4} from 'uuid';
import { syncAllDataToCloud } from '../utils/cloudSync';

export function useRoutines() {
    const [routines , setRoutines] = useLocalStorage('routines', []);

    const addRoutine = ({name , days, exerciseIds}) => {
        const newRoutine = {
            id: uuidv4(),
            name,
            days: days || [],
            exerciseIds: exerciseIds || [],
            createdAt: new Date().toISOString(),
        };
        setRoutines(prev=>[...prev, newRoutine]);
            // Fire-and-forget cloud sync
            syncAllDataToCloud().catch(err => console.error("Sync failed:", err));
        return newRoutine;
    };

    const updateRoutine = (id, updates) => {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        // Fire-and-forget cloud sync
        syncAllDataToCloud().catch(err => console.error("Sync failed:", err));
    };
    const deleteRoutine = (id) => {
        setRoutines(prev => prev.filter(r => r.id !== id));
        // Fire-and-forget cloud sync
        syncAllDataToCloud().catch(err => console.error("Sync failed:", err));
    };
    const getTodaysRoutine = () => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return routines.find(r => r.days.includes(today)) || null;
    };

    return { routines, addRoutine, updateRoutine, deleteRoutine, getTodaysRoutine };
}