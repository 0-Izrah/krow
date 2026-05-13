import { useRoutines } from "../hooks/useRoutines";
import { useWorkoutLogs } from "../hooks/useWorkoutLogs";
import { calculateStreak } from "../utils/streak";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
	const { getTodaysRoutine } = useRoutines();
	const { logs, getLogsThisWeek } = useWorkoutLogs();
	const navigate = useNavigate();

	const streak = calculateStreak(logs);
	const todayRoutine = getTodaysRoutine();
	const weekLogs = getLogsThisWeek();

	const dynamicGreeting = () => {
		if (streak > 2) {
			return `Time to grind. You're on a ${streak}-day streak! 🔥`;
		}
		if (todayRoutine) {
			return `Are we hitting ${todayRoutine.name} today?`;
		}
		if (logs.length === 0) {
			return `Let's get started. Log your first workout.`;
		}
		return `Rest day? Or just plotting the next move?`;
	};

	return (
		<div className="pt-8 pb-4 space-y-5 animate-in fade-in">
			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<p className="text-grind-accent text-sm font-medium mb-1 drop-shadow-[0_0_8px_rgba(200,255,0,0.5)]">
						{dynamicGreeting()}
					</p>
					<h1 className="font-display text-5xl text-grind-text tracking-wider">
						KROW
					</h1>
				</div>
				<button 
					onClick={() => navigate('/settings')} 
					className="text-grind-muted hover:text-white transition-colors text-2xl pb-1"
				>
					⚙️
				</button>
			</div>

			{/* Streak + Weekly Count */}
			<div className="grid grid-cols-2 gap-3">
				<Card>
					<p className="text-grind-muted text-xs mb-1">
						Current Streak
					</p>
					<p className="font-display text-4xl text-grind-accent">
						{streak}
					</p>
					<p className="text-grind-muted text-xs">
						{streak === 1 ? "day" : "days"}
					</p>
				</Card>
				<Card>
					<p className="text-grind-muted text-xs mb-1">This Week</p>
					<p className="font-display text-4xl text-grind-text">
						{weekLogs.length}
					</p>
					<p className="text-grind-muted text-xs">sessions</p>
				</Card>
			</div>

			{/* Today's Routine */}
			<Card>
				<p className="text-grind-muted text-xs mb-2">TODAY'S ROUTINE</p>
				{todayRoutine ? (
					<>
						<h2 className="font-display text-2xl text-grind-text mb-1 tracking-wide">
							{todayRoutine.name}
						</h2>
						<p className="text-grind-muted text-sm mb-4">
							{todayRoutine.exerciseIds.length} exercises
						</p>
						<Button
							onClick={() => navigate("/log")}
							className="w-full"
						>
							Start Session →
						</Button>
					</>
				) : (
					<>
						<p className="text-grind-muted text-sm mb-3">
							No routine scheduled for today.
						</p>
						<Button
							variant="ghost"
							onClick={() => navigate("/routines")}
							className="w-full"
						>
							Set up routines
						</Button>
					</>
				)}
			</Card>

			{/* Recent Logs */}
			{logs.length > 0 && (
				<div>
					<p className="text-grind-muted text-xs mb-3 tracking-widest">
						RECENT SESSIONS
					</p>
					<div className="space-y-2">
						{logs.slice(0, 3).map((log) => (
							<Card key={log.id}>
								<div className="flex justify-between items-center">
									<div>
										<p className="text-grind-text text-sm font-medium">
											{log.routineName}
										</p>
										<p className="text-grind-muted text-xs">
											{new Date(
												log.date,
											).toLocaleDateString("en-GB", {
												weekday: "short",
												day: "numeric",
												month: "short",
											})}
										</p>
									</div>
									<span className="text-grind-accent text-xl">
										✓
									</span>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
