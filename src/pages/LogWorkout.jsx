import { useState, useEffect } from "react";
import { useRoutines } from "../hooks/useRoutines";
import { useExercises } from "../hooks/useExercises";
import { useWorkoutLogs } from "../hooks/useWorkoutLogs";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { getYoutubeEmbedUrl } from "../utils/youtube";
import { playDing, vibrate } from "../utils/feedback";
import { SetTimer } from "../components/SetTimer";

export function LogWorkout() {
	const { getTodaysRoutine, routines } = useRoutines();
	const { getExerciseById } = useExercises();
	const { logWorkout, logs } = useWorkoutLogs();
	const navigate = useNavigate();

	const todayRoutine = getTodaysRoutine();
	const [selectedRoutineId, setSelectedRoutineId] = useState(
		todayRoutine?.id || "",
	);
	const [sessionState, setSessionState] = useState(null);
	const [currentExIndex, setCurrentExIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [restingSet, setRestingSet] = useState(null);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [previousLog, setPreviousLog] = useState(null);

	const activeRoutine = routines.find((r) => r.id === selectedRoutineId);

// Get the most recent log for this routine
	useEffect(() => {
		if (selectedRoutineId) {
			const lastLog = logs
				.filter((log) => log.routineId === selectedRoutineId)
				.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
			setPreviousLog(lastLog || null);
		}
	}, [selectedRoutineId, logs]);

	const startSession = () => {
		if (!activeRoutine) return;
		// Build the session state: for each exercise, create empty set tracking
		const session = activeRoutine.exerciseIds.map((config) => {
			const ex = getExerciseById(config.exerciseId);
			return {
				exerciseId: config.exerciseId,
				exerciseName: ex?.name || "Unknown",
				restSeconds: config.restSeconds || 60,
				sets: Array.from({ length: config.sets }, (_, i) => ({
					setNumber: i + 1,
					reps: config.reps,
					completed: false,
				})),
			};
		});
		setSessionState(session);
		setCurrentExIndex(0);
	};

	// Get previous performance for an exercise
	const getPreviousExerciseData = (exerciseId) => {
		if (!previousLog) return null;
		return previousLog.completedExercises.find(
			(ex) => ex.exerciseId === exerciseId,
		);
	};

	// Determine PRs (all-time highest reps for a single set) for an exercise
	const getExercisePR = (exerciseId) => {
		let maxReps = 0;
		logs.forEach((l) => {
			const record = l.completedExercises?.find((e) => e.exerciseId === exerciseId);
			if (record && record.sets) {
				record.sets.forEach((s) => {
					if (s.completed && s.reps > maxReps) maxReps = s.reps;
				});
			}
		});
		return maxReps;
	};

	// Rest timer effect
	useEffect(() => {
		if (!restingSet) return;

		const interval = setInterval(() => {
			setRestingSet((prev) => {
				if (!prev) return null;
				const newSeconds = prev.secondsRemaining - 1;
				if (newSeconds <= 0) {
					playDing();
					vibrate([100, 50, 100, 50, 200]);
					return null;
				}
				return { ...prev, secondsRemaining: newSeconds };
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [restingSet]);

	const toggleSet = (exerciseIdx, setIdx) => {
		setSessionState((prev) =>
			prev.map((ex, ei) => {
				if (ei !== exerciseIdx) return ex;
				return {
					...ex,
					sets: ex.sets.map((s, si) => {
						if (si === setIdx) {
							const newCompleted = !s.completed;
							// If marking as complete, start rest timer
							if (newCompleted) {
								vibrate(40); // Satisfying thud on log
								if (ex.restSeconds > 0) {
									setRestingSet({
										exerciseIdx,
										setIdx,
										secondsRemaining: ex.restSeconds,
										maxSeconds: ex.restSeconds,
									});
								}
							}
							return { ...s, completed: newCompleted };
						}
						return s;
					}),
				};
			}),
		);
	};

	const updateReps = (exerciseIdx, setIdx, value) => {
		setSessionState((prev) =>
			prev.map((ex, ei) => {
				if (ei !== exerciseIdx) return ex;
				return {
					...ex,
					sets: ex.sets.map((s, si) =>
						si === setIdx ? { ...s, reps: Number(value) } : s,
					),
				};
			}),
		);
	};

	const finishSession = () => {
		logWorkout({
			routineId: activeRoutine.id,
			routineName: activeRoutine.name,
			completedExercises: sessionState,
		});
		setIsComplete(true);
	};

	const totalSets =
		sessionState?.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;
	const completedSets =
		sessionState?.reduce(
			(acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
			0,
		) || 0;

	if (isComplete) {
		return (
			<div className="pt-16 flex flex-col items-center justify-center min-h-[70dvh] text-center space-y-6">
				<p className="text-7xl mb-2">⚡</p>
				<h1 className="font-display text-6xl text-grind-accent tracking-wider drop-shadow-[0_0_20px_rgba(200,255,0,0.3)]">
					WORKOUT COMPLETE
				</h1>
				<div className="bg-gradient-to-br from-grind-accent/10 to-transparent border border-grind-accent/30 rounded-2xl px-6 py-4 mt-4">
					<p className="text-2xl text-white font-bold">{completedSets}</p>
					<p className="text-grind-muted text-sm">sets completed</p>
				</div>
				<Button onClick={() => navigate("/")} className="mt-6 shadow-lg">
					Back Home
				</Button>
			</div>
		);
	}

	return (
		<div className="pt-8 pb-4 space-y-5">
			<h1 className="font-display text-4xl tracking-wider">
				LOG SESSION
			</h1>

			{!sessionState ? (
				<>
					{/* Routine selector */}
					<div>
						<label className="text-grind-muted text-xs block mb-2">
							Select Routine
						</label>
						<select
							value={selectedRoutineId}
							onChange={(e) =>
								setSelectedRoutineId(e.target.value)
							}
							className="w-full bg-grind-card border border-grind-border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none"
						>
							<option value="">-- Pick a routine --</option>
							{routines.map((r) => (
								<option key={r.id} value={r.id}>
									{r.name}
								</option>
							))}
						</select>
					</div>

					{activeRoutine && (
						<Card>
							<p className="text-grind-muted text-xs mb-1">
								SELECTED
							</p>
							<h2 className="font-display text-2xl text-grind-text tracking-wide mb-1">
								{activeRoutine.name}
							</h2>
							<p className="text-grind-muted text-sm">
								{activeRoutine.exerciseIds.length} exercises
							</p>
						</Card>
					)}

					<Button
						onClick={startSession}
						disabled={!activeRoutine}
						className="w-full text-base py-3"
					>
						Start Session →
					</Button>
				</>
			) : (
				<>
					{/* Routine header with change button */}
					<div className="flex items-center justify-between">
						<div>
							<p className="text-grind-muted text-xs mb-1">
								CURRENT SESSION
							</p>
							<h2 className="font-display text-2xl text-grind-text tracking-wide">
								{activeRoutine.name}
							</h2>
						</div>
						<Button
							variant="ghost"
							onClick={() => {
								setSessionState(null);
								setRestingSet(null);
							}}
							className="text-sm px-2 py-1"
						>
							Change ↻
						</Button>
					</div>

					{/* REST TIMER - appears when resting */}
					{restingSet && (
						<div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center">
							<div className="text-center space-y-4 px-6">
								<p className="text-grind-muted text-sm">
									Rest time for Set {restingSet.setIdx + 1}
								</p>
								<div className="relative w-32 h-32 mx-auto flex items-center justify-center">
									<svg className="w-full h-full transform -rotate-90">
										<circle
											cx="64"
											cy="64"
											r="60"
											fill="none"
											stroke="#1f1f1f"
											strokeWidth="4"
										/>
										<circle
											cx="64"
											cy="64"
											r="60"
											fill="none"
											stroke="#c8ff00"
											strokeWidth="4"
											strokeDasharray={`${(restingSet.secondsRemaining / restingSet.maxSeconds) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
											strokeLinecap="round"
											className="transition-all"
										/>
									</svg>
									<div className="absolute text-center">
										<p className="font-display text-5xl text-grind-accent">
											{restingSet.secondsRemaining}
										</p>
										<p className="text-grind-muted text-xs">
											seconds
										</p>
									</div>
								</div>
								<Button
									variant="secondary"
									onClick={() => setRestingSet(null)}
									className="w-32 mx-auto"
								>
									Skip ⏭
								</Button>
							</div>
						</div>
					)}

					{/* Progress bar */}
					<div>
						<div className="flex justify-between text-xs text-grind-muted mb-1">
							<span>Progress</span>
							<span>
								{completedSets} / {totalSets} sets
							</span>
						</div>
						<div className="h-1.5 bg-grind-border rounded-full overflow-hidden">
							<div
								className="h-full bg-grind-accent rounded-full transition-all"
								style={{
									width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%`,
								}}
							/>
						</div>
					</div>

					{/* Active Exercise Focus View */}
					{(() => {
						const ex = sessionState[currentExIndex];
						const ei = currentExIndex;
						const prevData = getPreviousExerciseData(ex.exerciseId);
						const exerciseDetails = getExerciseById(ex.exerciseId);
						
						const prevCompleted = prevData?.sets.filter((s) => s.completed).length;
						const prevTotal = prevData?.sets.length;
						const currentPR = getExercisePR(ex.exerciseId);

						return (
							<div className="space-y-4">
								<Card>
									<div className="flex items-start justify-between mb-3">
										<h3 className="font-display text-3xl text-grind-text tracking-wide">
											{ex.exerciseName}
										</h3>
										<span className="text-grind-muted text-sm font-medium bg-grind-bg px-2 py-1 rounded-lg">
											{currentExIndex + 1} / {sessionState.length}
										</span>
									</div>
									
									{/* YouTube Embed */}
									{exerciseDetails?.youtubeUrl && getYoutubeEmbedUrl(exerciseDetails.youtubeUrl) && (
										<div className="rounded-xl overflow-hidden aspect-video mb-5 border border-grind-border">
											<iframe
												src={getYoutubeEmbedUrl(exerciseDetails.youtubeUrl)}
												className="w-full h-full"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
												allowFullScreen
												title={ex.exerciseName}
											/>
										</div>
									)}

									{prevData && (
										<div className="flex gap-4 mb-5 text-sm bg-grind-bg rounded-xl p-3 border border-grind-border/50">
											<div>
												<p className="text-grind-muted text-[10px] uppercase tracking-wider mb-0.5">Last time</p>
												<p className="text-grind-text font-medium">{prevCompleted}/{prevTotal} sets</p>
											</div>
											<div>
												<p className="text-grind-muted text-[10px] uppercase tracking-wider mb-0.5">Target Rest</p>
												<p className="text-grind-text font-medium">{ex.restSeconds}s</p>
											</div>
										</div>
									)}

									{/* Interactive Sets */}
									<div className="space-y-3 mt-4">
										{ex.sets.map((set, si) => {
											const isPR = set.completed && set.reps > currentPR && currentPR > 0;
											return (
											<div key={si} className="flex items-center gap-3 relative">
												{isPR && (
													<span className="absolute -top-2 left-6 text-sm animate-bounce z-20 drop-shadow-[0_0_10px_rgba(200,255,0,0.8)]">🏆</span>
												)}
												<div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${set.completed ? "bg-grind-accent text-black" : "bg-grind-border text-grind-muted"}`}>
													{set.setNumber}
												</div>
												
												<div className={`flex-1 flex gap-2 justify-between items-center bg-[#1a1a1a] rounded-xl px-2 py-1.5 border ${isPR ? 'border-grind-accent/50 shadow-[0_0_10px_rgba(200,255,0,0.1)]' : 'border-grind-border'}`}>
													<button 
														className="px-3 py-1 text-2xl text-grind-muted hover:text-white active:scale-95 transition-transform" 
														onClick={() => updateReps(ei, si, Math.max(0, set.reps - 1))}
													>-</button>
													<span className={`text-2xl font-display w-12 text-center ${isPR ? 'text-grind-accent' : 'text-white'}`}>{set.reps}</span>
													<button 
														className="px-3 py-1 text-2xl text-grind-muted hover:text-white active:scale-95 transition-transform" 
														onClick={() => updateReps(ei, si, Number(set.reps) + 1)}
													>+</button>
												</div>

												{prevData && prevData.sets[si] && (
													<div className="w-10 text-center flex flex-col shrink-0">
														<span className="text-[10px] text-grind-muted leading-none">prev</span>
														<span className="text-sm font-medium text-grind-muted">{prevData.sets[si].reps}</span>
													</div>
												)}

												<button 
													onClick={() => toggleSet(ei, si)}
													className={`h-12 w-20 rounded-xl font-bold tracking-wide text-sm transition-all shrink-0 ${
														set.completed 
															? "bg-grind-accent text-black shadow-[0_0_15px_rgba(200,255,0,0.2)]" 
															: "bg-grind-bg border border-grind-border text-grind-text hover:border-grind-accent/50"
													}`}
												>
													{set.completed ? "DONE" : "LOG"}
												</button>
											</div>
										)})}
									</div>
								</Card>

								{/* Navigation Controls */}
								<div className="flex gap-2 pt-2">
									<Button 
										variant="ghost" 
										onClick={() => {
											if (currentExIndex === 0) {
												setIsCancelModalOpen(true);
											} else {
												setCurrentExIndex(c => c - 1);
											}
										}}
										className="flex-1"
									>
										{currentExIndex === 0 ? "Cancel" : "← Prev"}
									</Button>
									<Button 
										variant={currentExIndex === sessionState.length - 1 ? "primary" : "secondary"}
										onClick={() => {
											if (currentExIndex === sessionState.length - 1) finishSession();
											else setCurrentExIndex(c => c + 1);
										}}
										className="flex-1"
									>
										{currentExIndex === sessionState.length - 1 ? "Finish" : "Next →"}
									</Button>
								</div>
							</div>
						);
					})()}
				</>
			)}

			<Modal
				isOpen={isCancelModalOpen}
				onClose={() => setIsCancelModalOpen(false)}
				title="Cancel Workout?"
			>
				<div className="space-y-4">
					<p className="text-grind-text text-sm">
						Are you sure you want to exit? Your progress for this session will be lost.
					</p>
					<div className="flex gap-3 pt-2">
						<Button
							onClick={() => setIsCancelModalOpen(false)}
							className="flex-1 !bg-grind-card !text-grind-text border border-grind-border"
						>
							Keep Going
						</Button>
						<Button
							variant="danger"
							onClick={() => {
								setSessionState(null);
								setRestingSet(null);
								setIsCancelModalOpen(false);
							}}
							className="flex-1"
						>
							End Session
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
