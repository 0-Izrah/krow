import { useLocalStorage } from "./useLocalStorage";
import { BUILT_IN_EXERCISES } from '../utils/builtInExercises';
import { useEffect } from 'react';

export function useExercises() {
    const [exercises, setExercises] = useLocalStorage('exercises', []);

    useEffect(() => {
        // Seed the database if it is empty
        if (!exercises || exercises.length === 0) {
            const seeded = BUILT_IN_EXERCISES.map(ex => ({
                ...ex,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString()
            }));
            setExercises(seeded);
        }
    }, []);

    const addExercise = (exercise) => {
        const newExercise = {
            id: crypto.randomUUID(),
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            youtubeUrl: exercise.youtubeUrl || '',
            notes: exercise.notes || '',
            type: exercise.type || 'reps',
            createdAt: new Date().toISOString(),
        };
        setExercises(prev => [...prev, newExercise]);
        return newExercise;
    };
    const updateExercise = (id, updates) => {
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    };
    const deleteExercise = (id) => {
        setExercises(prev => prev.filter(ex => ex.id !== id));
    };
    const getExerciseById = (id) => {
        return exercises.find(ex => ex.id === id);
    };

    return { exercises, addExercise, updateExercise, deleteExercise , getExerciseById };
}