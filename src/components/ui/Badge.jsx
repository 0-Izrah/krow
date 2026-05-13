export function Badge({ children, color = "default" }) {
	const colors = {
		default: "bg-grind-border/40 text-grind-muted border border-grind-border/50",
		accent: "bg-grind-accent/20 text-grind-accent border border-grind-accent/50 font-semibold",
		green: "bg-green-900/30 text-green-400 border border-green-900/50",
		red: "bg-red-900/30 text-red-400 border border-red-900/50",
	};

	return (
		<span
			className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${colors[color]}`}
		>
			{children}
		</span>
	);
}
