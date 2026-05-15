import { useRoutines } from "../hooks/useRoutines";
import { useWorkoutLogs } from "../hooks/useWorkoutLogs";
import { calculateStreak } from "../utils/streak";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
	const { getTodaysRoutines } = useRoutines();
	const { logs, getLogsThisWeek } = useWorkoutLogs();
	const navigate = useNavigate();

	const streak = calculateStreak(logs);
	const todaysRoutines = getTodaysRoutines();
	const weekLogs = getLogsThisWeek();

	// Get today's logs using LOCAL time
	const getTodaysLogs = () => {
		const today = new Date();
		return logs.filter((log) => {
			if (!log.date) return false;
			const logDate = new Date(log.date);
			return (
				logDate.getDate() === today.getDate() &&
				logDate.getMonth() === today.getMonth() &&
				logDate.getFullYear() === today.getFullYear()
			);
		});
	};

	const todaysLogs = getTodaysLogs();
	const todaysSessionCount = todaysLogs.length;

	const dynamicGreeting = () => {
		const greetings = [
			// Streak-based greetings
			...(streak >= 10
				? [
						`UNSTOPPABLE. ${streak}-day streak and counting. 🔥🔥🔥`,
						`Legend status: ${streak}-day streak. Keep it going! 👑`,
						`${streak} days strong. Don't break the chain! ⛓️`,
					]
				: []),
			...(streak >= 5 && streak < 10
				? [
						`On fire! ${streak}-day streak going strong. 🔥`,
						`${streak} days deep. This is the grind. 💪`,
					]
				: []),
			...(streak > 2 && streak < 5
				? [
						`Time to grind. You're on a ${streak}-day streak! 🔥`,
						`${streak}-day streak. Let's keep rolling.`,
					]
				: []),

			// Multiple sessions today
			...(todaysSessionCount > 1
				? [
						`Double down! You've already got ${todaysSessionCount} sessions today. Push for more! 💥`,
						`${todaysSessionCount} sessions today? Beast mode activated! 🐉`,
						`Already ${todaysSessionCount} deep today. Finish strong! 🚀`,
					]
				: []),


            ...(todaysRoutines.length > 0 && todaysSessionCount === 0 ? [
                `You have ${todaysRoutines.length} routine${todaysRoutines.length > 1 ? 's' : ''} on the schedule today.`,
                `${todaysRoutines[0].name}${todaysRoutines.length > 1 ? ' and more' : ''} is calling. You ready?`,
                `Today's mission: ${todaysRoutines[0].name}. Let's go.`,
            ] : []),
			
			// Just logged today
			...(todaysSessionCount === 1
				? [
						`One down. The day's still young. Ready for round two?`,
						`Good start. Keep the momentum going! 💨`,
						`Session logged. Now finish the day strong.`,
					]
				: []),

			// No logs
			...(logs.length === 0
				? [
						`Let's get started. Log your first workout.`,
						`Time to build the foundation. First rep starts now.`,
						`New grind, same mentality. Let's go.`,
					]
				: []),

			// Default/rest day
			`Rest day? Or just plotting the next move?`,
			`The grind never stops. What's next?`,
			`Recovery is growth. Use it wisely.`,
		];

		// Filter out empty arrays and flatten
		const validGreetings = greetings.filter((g) => typeof g === "string");
		return validGreetings[
			Math.floor(Math.random() * validGreetings.length)
		];
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
					onClick={() => navigate("/settings")}
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

			{/* Today's Routines */}
            <Card>
                <p className="text-grind-muted text-xs mb-2">TODAY'S SCHEDULE</p>
                {todaysRoutines.length > 0 ? (
                    <div className="space-y-4">
                        {todaysRoutines.map((routine, index) => (
                            <div key={routine.id} className={`${index !== todaysRoutines.length - 1 ? "border-b border-grind-border/50 pb-4" : ""}`}>
                                <h2 className="font-display text-2xl text-grind-text mb-1 tracking-wide">
                                    {routine.name}
                                </h2>
                                <p className="text-grind-muted text-sm mb-3">
                                    {routine.exerciseIds.length} exercises
                                </p>
								<Button
									// Pass the specific routine ID in the navigation state
									onClick={() => navigate("/log", { state: { routineId: routine.id } })}
									className="w-full"
								>
									Start {routine.name} →
								</Button>
                            </div>
                        ))}
                    </div>
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

			{/* Today's Sessions */}
			{todaysSessionCount > 0 && (
				<div>
					<p className="text-grind-muted text-xs mb-3 tracking-widest">
						TODAY'S SESSIONS ({todaysSessionCount})
					</p>
					<div className="space-y-2">
						{todaysLogs.map((log) => (
							<Card key={log.id}>
								<div className="flex justify-between items-center">
									<div>
										<p className="text-grind-text text-sm font-medium">
											{log.routineName}
										</p>
										<p className="text-grind-muted text-xs">
											{new Date(
												log.date,
											).toLocaleTimeString("en-GB", {
												hour: "2-digit",
												minute: "2-digit",
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

			{/* Recent Sessions */}
			{logs.length > 0 && (
				<div>
					<p className="text-grind-muted text-xs mb-3 tracking-widest">
						RECENT SESSIONS
					</p>
					<div className="space-y-2">
						{logs
							.filter((log) => {
								// Exclude today's logs using reliable local time comparison
								if (!log.date) return false;
								const today = new Date();
								const logDate = new Date(log.date);
								const isToday =
									logDate.getDate() === today.getDate() &&
									logDate.getMonth() === today.getMonth() &&
									logDate.getFullYear() ===today.getFullYear();
								return !isToday;
							})
							.slice(0, 3)
							.map((log) => (
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
