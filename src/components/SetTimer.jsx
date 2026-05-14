import { useState, useEffect, useRef } from "react";

export function SetTimer({ duration, onComplete }) {
	const [timeLeft, setTimeLeft] = useState(duration);
	const [isRunning, setIsRunning] = useState(false);
	const [isDone, setIsDone] = useState(false);
	const intervalRef = useRef(null);

	// Reset if duration changes (new set)
	useEffect(() => {
		setTimeLeft(duration);
		setIsRunning(false);
		setIsDone(false);
	}, [duration]);

	useEffect(() => {
		if (!isRunning) return;

		intervalRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(intervalRef.current);
					setIsRunning(false);
					setIsDone(true);
					onComplete(); // auto-marks the set as done
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(intervalRef.current);
	}, [isRunning]);

	const progress = ((duration - timeLeft) / duration) * 100;

	const formatTime = (s) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${String(sec).padStart(2, "0")}` : `${sec}s`;
	};

	const handleToggle = () => {
		if (isDone) {
			// Reset for another set
			setTimeLeft(duration);
			setIsDone(false);
			setIsRunning(false);
		} else {
			setIsRunning((p) => !p);
		}
	};

	return (
		<div className="flex flex-col gap-2 w-full">
			{/* Progress Bar */}
			<div className="h-2 bg-grind-border rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-1000 ${
						isDone ? "bg-green-400" : "bg-grind-accent"
					}`}
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Timer + Button Row */}
			<div className="flex items-center justify-between">
				{/* Time Display */}
				<span
					className={`font-display text-3xl tracking-widest ${
						isDone
							? "text-green-400"
							: isRunning
								? "text-grind-accent"
								: "text-grind-muted"
					}`}
				>
					{isDone ? "DONE" : formatTime(timeLeft)}
				</span>

				{/* Control Button */}
				<button
					onClick={handleToggle}
					className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
						isDone
							? "bg-grind-border text-grind-muted"
							: isRunning
								? "bg-red-900 text-red-200"
								: "bg-grind-accent text-black"
					}`}
				>
					{isDone ? "Reset" : isRunning ? "Pause" : "Start"}
				</button>
			</div>
		</div>
	);
}
