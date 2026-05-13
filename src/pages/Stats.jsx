import { useMemo, useState } from "react";
import { useWorkoutLogs } from "../hooks/useWorkoutLogs";
import { useExercises } from "../hooks/useExercises";
import { calculateStreak } from "../utils/streak";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { 
	AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
	Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";

function GrindHeatmap({ logs }) {
	const { heatmapData, maxSets } = useMemo(() => {
		const toDateString = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		
		const today = new Date();
		today.setHours(0,0,0,0);
		const start = new Date(today);
		start.setDate(today.getDate() - 90);
		start.setDate(start.getDate() - start.getDay()); // align to closest Sunday

		const data = [];
		const curr = new Date(start);
		while (curr <= today) {
			data.push({
				date: toDateString(curr),
				dateObj: new Date(curr),
				count: 0
			});
			curr.setDate(curr.getDate() + 1);
		}

		// Map logs to counts (volume = sets completed)
		logs.forEach(log => {
			const logDateObj = new Date(log.date);
			const logDate = toDateString(logDateObj);
			const dayData = data.find(d => d.date === logDate);
			if (dayData) {
				const sets = log.completedExercises?.reduce((acc, ex) => {
					return acc + (ex.sets?.filter(s => s.completed)?.length || 0);
				}, 0) || 0;
				dayData.count += sets;
			}
		});

		const maxSets = Math.max(...data.map(d => d.count), 1);
		return { heatmapData: data, maxSets };
	}, [logs]);

	return (
		<div>
			<p className="text-white text-xs font-bold uppercase tracking-widest mb-3">The Grind (90 Days)</p>
			<Card className="p-5">
				<div 
					className="w-full overflow-x-auto no-scrollbar pb-2" 
					// Using flex row reverse to ensure scroll rests at the right edge (Today) on load
					style={{ direction: 'rtl' }} 
				>
					<div 
						className="grid grid-flow-col gap-1.5 auto-cols-max" 
						style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))', direction: 'ltr' }}
					>
						{heatmapData.map((day) => {
							let opacity = 0.05;
							if (day.count > 0) {
								opacity = 0.4 + (day.count / maxSets) * 0.6;
							}
							
							return (
								<div 
									key={day.date}
									title={`${day.count} sets on ${day.date}`}
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] transition-all duration-300"
									style={{ 
										backgroundColor: day.count > 0 ? `rgba(200, 255, 0, ${opacity})` : 'rgba(255, 255, 255, 0.05)',
										boxShadow: day.count > 0 ? `0 0 ${opacity * 8}px rgba(200, 255, 0, ${opacity * 0.4})` : 'none'
									}}
								/>
							);
						})}
					</div>
				</div>
                <div className="flex justify-between items-center mt-3 text-grind-muted text-[10px] font-bold uppercase tracking-widest">
                    <span>Focus</span>
                    <div className="flex items-center gap-1.5">
						<span>Less</span>
						<div className="flex gap-1">
							<div className="w-2.5 h-2.5 rounded-[2px] bg-white/5" />
							<div className="w-2.5 h-2.5 rounded-[2px] bg-grind-accent/40" />
							<div className="w-2.5 h-2.5 rounded-[2px] bg-grind-accent/70" />
							<div className="w-2.5 h-2.5 rounded-[2px] bg-grind-accent shadow-[0_0_8px_rgba(200,255,0,0.5)]" />
						</div>
						<span>More</span>
					</div>
                </div>
			</Card>
		</div>
	);
}

export function Stats() {
	const { logs, getLogsThisWeek } = useWorkoutLogs();
	const { exercises } = useExercises();
	const streak = calculateStreak(logs);
	const weekLogs = getLogsThisWeek();
	const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, TRENDS, TROPHY

	// Calculate trend data for the chart
	const trendData = useMemo(() => {
		const weeklyVolumes = {};
		
		[...logs].reverse().forEach(log => {
			const d = new Date(log.date);
			// Calculate week key (e.g. "Week 42")
			const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
			const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
			const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
			const month = d.toLocaleString('default', { month: 'short' });
			const key = `${month} W${weekNum}`;

			if (!weeklyVolumes[key]) {
				weeklyVolumes[key] = { label: key, volume: 0, sessions: 0 };
			}
			
			// Calculate volume for this session (total reps completed)
			let sessionVolume = 0;
			log.completedExercises?.forEach(ex => {
				ex.sets?.forEach(s => {
					if (s.completed) sessionVolume += s.reps;
				});
			});

			weeklyVolumes[key].volume += sessionVolume;
			weeklyVolumes[key].sessions += 1;
		});

		return Object.values(weeklyVolumes).slice(-4); // Last 4 weeks
	}, [logs]);

	// Calculate Muscle Group Radar data
	const radarData = useMemo(() => {
		const groups = { "CHEST": 0, "BACK": 0, "LEGS": 0, "ARMS": 0, "SHOULDERS": 0, "CORE": 0 };
		
		logs.forEach(log => {
			log.completedExercises?.forEach(ex => {
				const exerciseDetails = exercises.find(e => e.id === ex.exerciseId);
				if (exerciseDetails?.muscleGroup) {
					const mg = exerciseDetails.muscleGroup.toUpperCase();
					if (groups[mg] !== undefined) {
						let volume = 0;
						ex.sets?.forEach(s => {
							if (s.completed) volume += s.reps;
						});
						groups[mg] += volume;
					}
				}
			});
		});

		// Normalize sizes slightly and check max, if all 0, use 1 to prevent chart collapse
		const data = Object.keys(groups).map(key => ({
			subject: key,
			A: groups[key] || 0,
			fullMark: Math.max(...Object.values(groups), 100)
		}));

		return data;
	}, [logs, exercises]);

	// History Modal State
	const [selectedLog, setSelectedLog] = useState(null);

	// Calculate PRs for the Trophy Room
	const trophyRoom = useMemo(() => {
		const prs = {}; // exerciseId -> { maxReps: 0, maxSets: 0, maxVolume: 0, name: '' }
		
		logs.forEach(log => {
			log.completedExercises?.forEach(ex => {
				if (!prs[ex.exerciseId]) {
					prs[ex.exerciseId] = { maxReps: 0, maxSets: 0, maxVolume: 0, name: ex.exerciseName };
				}

				let exVolume = 0;
				let exSets = 0;
				
				ex.sets?.forEach(s => {
					if (s.completed) {
						exSets++;
						exVolume += s.reps;
						if (s.reps > prs[ex.exerciseId].maxReps) {
							prs[ex.exerciseId].maxReps = s.reps;
						}
					}
				});

				if (exSets > prs[ex.exerciseId].maxSets) {
					prs[ex.exerciseId].maxSets = exSets;
				}
				if (exVolume > prs[ex.exerciseId].maxVolume) {
					prs[ex.exerciseId].maxVolume = exVolume;
				}
			});
		});

		return Object.values(prs).sort((a, b) => b.maxVolume - a.maxVolume);
	}, [logs]);

	return (
		<div className="pt-8 pb-4 space-y-6">
			<div>
				<p className="text-grind-accent text-xs font-bold uppercase tracking-widest mb-1">Track Your Progress</p>
				<h1 className="font-display text-5xl tracking-widest text-white">
					STATS
				</h1>
			</div>

			{/* Custom Tabs */}
			<div className="flex gap-2 bg-grind-card p-1 rounded-xl overflow-x-auto no-scrollbar">
				{["OVERVIEW", "TRENDS", "TROPHY", "HISTORY"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`flex-1 min-w-[80px] py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
							activeTab === tab 
							? "bg-grind-accent text-black shadow-[0_0_10px_rgba(200,255,0,0.3)]" 
							: "text-grind-muted hover:text-white"
						}`}
					>
						{tab === "TROPHY" ? "🏆 TROPHY" : tab}
					</button>
				))}
			</div>

			{activeTab === "OVERVIEW" && (
				<div className="space-y-6 animate-in fade-in">
					{/* Streak Card */}
					<Card className="bg-gradient-to-r from-grind-accent/10 via-transparent to-transparent border-l-4 border-l-grind-accent">
						<div className="flex items-end justify-between">
							<div>
								<p className="text-grind-muted text-xs uppercase tracking-widest font-bold mb-2">Current Streak</p>
								<p className="font-display text-6xl text-grind-accent drop-shadow-[0_0_15px_rgba(200,255,0,0.3)]">
									{streak}
								</p>
								<p className="text-grind-muted text-sm mt-1">Days in a row</p>
							</div>
							<span className="text-5xl">🔥</span>
						</div>
					</Card>

					{/* Grind Heatmap */}
					<GrindHeatmap logs={logs} />

					<div className="grid grid-cols-2 gap-3">
						<Card>
							<p className="text-grind-muted text-xs uppercase tracking-widest font-bold mb-2">Total</p>
							<div className="flex items-baseline gap-2">
								<p className="font-display text-4xl text-white">{logs.length}</p>
								<p className="text-grind-muted text-xs mb-1">sessions</p>
							</div>
						</Card>

						{/* This Week */}
						<Card>
							<p className="text-grind-muted text-xs uppercase tracking-widest font-bold mb-2">This Wk</p>
							<div className="flex items-baseline gap-2">
								<p className="font-display text-4xl text-grind-accent">{weekLogs.length}</p>
								<p className="text-grind-muted text-xs mb-1">sessions</p>
							</div>
						</Card>
					</div>
				</div>
			)}

			{activeTab === "TRENDS" && (
				<div className="space-y-6 animate-in fade-in">
					<Card>
						<div>
							<p className="text-grind-muted text-xs uppercase tracking-widest font-bold mb-2">Progressive Overload</p>
							<p className="text-xs text-grind-muted mb-6">Total reps completed over the last 4 weeks.</p>
							
							{trendData.length > 0 ? (
								<div className="h-64 w-full">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
											<defs>
												<linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#c8ff00" stopOpacity={0.5}/>
													<stop offset="95%" stopColor="#c8ff00" stopOpacity={0}/>
												</linearGradient>
											</defs>
											<XAxis dataKey="label" stroke="#4a4a4a" fontSize={10} tickMargin={10} />
											<YAxis stroke="#4a4a4a" fontSize={10} tickFormatter={(val) => val} />
											<Tooltip 
												contentStyle={{ backgroundColor: '#111111', borderColor: '#c8ff00', borderRadius: '8px' }}
												itemStyle={{ color: '#c8ff00', fontWeight: 'bold' }}
											/>
											<Area 
												type="monotone" 
												dataKey="volume" 
												stroke="#c8ff00" 
												strokeWidth={3} 
												fillOpacity={1} 
												fill="url(#colorVolume)"
												activeDot={{ r: 6, fill: '#c8ff00', stroke: '#111111', strokeWidth: 2 }} 
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="h-32 flex items-center justify-center border border-grind-border border-dashed rounded-lg">
									<p className="text-grind-muted text-sm">Not enough data to map trends.</p>
								</div>
							)}
						</div>
					</Card>

					<Card>
						<div>
							<p className="text-grind-muted text-xs uppercase tracking-widest font-bold mb-2">Muscle Focus Radar</p>
							<p className="text-xs text-grind-muted mb-2">Lifetime volume distribution.</p>
							
							<div className="h-64 w-full">
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
										<PolarGrid stroke="#333" />
										<PolarAngleAxis dataKey="subject" tick={{ fill: '#a0a0a0', fontSize: 10, fontWeight: 'bold' }} />
										<PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
										<Radar 
											name="Volume" 
											dataKey="A" 
											stroke="#c8ff00" 
											strokeWidth={2}
											fill="#c8ff00" 
											fillOpacity={0.3} 
										/>
										<Tooltip 
											contentStyle={{ backgroundColor: '#111111', borderColor: '#c8ff00', borderRadius: '8px' }}
											itemStyle={{ color: '#c8ff00', fontWeight: 'bold' }}
											formatter={(value) => [value, "Volume"]}
										/>
									</RadarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</Card>
				</div>
			)}

			{activeTab === "TROPHY" && (
				<div className="space-y-4 animate-in fade-in">
					<p className="text-grind-muted text-xs mb-2">Your highest achievements across all time.</p>
					
					{trophyRoom.length > 0 ? (
						<div className="space-y-3">
							{trophyRoom.map((pr, i) => (
								<Card key={i} className="flex items-center gap-4 border-l-2 border-grind-accent/50 relative overflow-hidden">
									<div className="absolute top-0 right-0 p-2 opacity-10 blur-[1px]">
										<span className="text-5xl grayscale">🏆</span>
									</div>
									<div className="w-10 h-10 rounded-full bg-grind-accent/10 flex items-center justify-center text-xl shrink-0 z-10">
										🏆
									</div>
									<div className="flex-1 z-10">
										<p className="font-bold text-white text-lg">{pr.name}</p>
										<div className="flex gap-4 mt-1">
											<div>
												<p className="text-[10px] text-grind-muted uppercase tracking-widest">Max Reps/Set</p>
												<p className="text-grind-accent font-mono text-xl">{pr.maxReps}</p>
											</div>
											<div>
												<p className="text-[10px] text-grind-muted uppercase tracking-widest">Max Session Vol</p>
												<p className="text-white font-mono text-xl">{pr.maxVolume}</p>
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<Card className="py-10 text-center border-dashed border-grind-border gap-2">
							<span className="text-4xl mb-2 block grayscale opacity-50">🏆</span>
							<p className="text-grind-muted">No personal records yet.</p>
							<p className="text-grind-muted text-xs">Log a workout to build your trophy room.</p>
						</Card>
					)}
				</div>
			)}

			{activeTab === "HISTORY" && (
				<div className="space-y-4 animate-in fade-in">
					<p className="text-grind-muted text-xs mb-4">Complete timeline of your training.</p>
					
					{logs.length > 0 ? (
						<div className="relative border-l-2 border-grind-border ml-3 pl-6 space-y-6">
							{[...logs].reverse().map((log) => {
								// Calculate summary stats for the log
								const totalSets = log.completedExercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed)?.length || 0), 0) || 0;
								const totalVolume = log.completedExercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed)?.reduce((a, s) => a + s.reps, 0) || 0), 0) || 0;
								
								return (
									<div key={log.id} className="relative">
										{/* Timeline dot */}
										<div className="absolute -left-[31.5px] top-4 w-3 h-3 rounded-full bg-grind-card border-2 border-grind-accent z-10 shadow-[0_0_8px_rgba(200,255,0,0.5)]" />
										
										<Card 
											className="cursor-pointer hover:border-grind-accent/50 transition-colors"
											onClick={() => setSelectedLog(log)}
										>
											<div className="flex justify-between items-start mb-2">
												<div>
													<h3 className="font-display text-2xl text-grind-text">{log.routineName}</h3>
													<p className="text-grind-muted text-xs">
														{new Date(log.date).toLocaleDateString("en-GB", {
															weekday: "long",
															day: "numeric",
															month: "short",
															year: "numeric"
														})}
													</p>
												</div>
												<span className="text-grind-accent/20 text-3xl">✓</span>
											</div>
											<div className="flex gap-4 mt-3">
												<div>
													<p className="text-[10px] text-grind-muted uppercase tracking-widest">Exercises</p>
													<p className="text-white font-mono">{log.completedExercises?.length || 0}</p>
												</div>
												<div>
													<p className="text-[10px] text-grind-muted uppercase tracking-widest">Sets</p>
													<p className="text-grind-accent font-mono">{totalSets}</p>
												</div>
												<div>
													<p className="text-[10px] text-grind-muted uppercase tracking-widest">Volume</p>
													<p className="text-white font-mono">{totalVolume}</p>
												</div>
											</div>
										</Card>
									</div>
								);
							})}
						</div>
					) : (
						<Card className="py-10 text-center border-dashed border-grind-border gap-2">
							<span className="text-4xl mb-2 block grayscale opacity-50">📜</span>
							<p className="text-grind-muted">Your history is blank.</p>
							<p className="text-grind-muted text-xs">Complete a workout to start your timeline.</p>
						</Card>
					)}
				</div>
			)}

			<Modal
				isOpen={!!selectedLog}
				onClose={() => setSelectedLog(null)}
				title={selectedLog?.routineName || "Workout Details"}
			>
				{selectedLog && (
					<div className="space-y-4">
						<p className="text-grind-accent text-sm pb-2 border-b border-grind-border">
							{new Date(selectedLog.date).toLocaleString()}
						</p>
						<div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
							{selectedLog.completedExercises?.map((ex, i) => (
								<div key={i} className="bg-grind-bg rounded-xl p-3 border border-grind-border/50">
									<p className="font-bold text-white text-md mb-2">{ex.exerciseName}</p>
									<div className="space-y-1.5">
										{ex.sets?.filter(s => s.completed).map((set, si) => (
											<div key={si} className="flex justify-between items-center text-sm">
												<span className="text-grind-muted">Set {set.setNumber}</span>
												<span className="text-grind-accent font-mono font-bold">{set.reps} reps</span>
											</div>
										))}
										{(!ex.sets || ex.sets.filter(s => s.completed).length === 0) && (
											<p className="text-grind-muted text-xs italic">No sets completed.</p>
										)}
									</div>
								</div>
							))}
						</div>
						<Button onClick={() => setSelectedLog(null)} className="w-full">
							Close
						</Button>
					</div>
				)}
			</Modal>
		</div>
	);
}
