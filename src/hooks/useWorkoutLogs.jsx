import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidv4 } from "uuid";

export function useWorkoutLogs() {
	const [logs, setLogs] = useLocalStorage("grind_logs", []);

	const logWorkout = ({ routineId, routineName, completedExercises }) => {
		// completedExercises: [{ exerciseId, exerciseName, sets: [{ reps, completed }] }]
		const newLog = {
			id: uuidv4(),
			routineId,
			routineName,
			completedExercises,
			date: new Date().toISOString(),
			duration: null, // you can calculate this if you track start time
		};
		setLogs((prev) => [newLog, ...prev]);
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

	const deleteLog = (id) => {
		setLogs((prev) => prev.filter((l) => l.id !== id));
	};

	return { logs, logWorkout, getLogsThisWeek, getLogsByDateRange, deleteLog };
}
