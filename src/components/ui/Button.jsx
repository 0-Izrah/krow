export function Button({
	children,
	onClick,
	variant = "primary",
	className = "",
	type = "button",
	disabled = false,
}) {
	const variants = {
		primary:
			"bg-grind-accent hover:bg-[#d4ff33] text-black font-bold uppercase tracking-wider shadow-lg shadow-grind-accent/20 hover:shadow-grind-accent/40",
		secondary: "bg-[#1a1a1a] text-white font-medium border border-grind-border hover:bg-[#222] hover:border-grind-accent/50",
		ghost: "bg-transparent text-grind-muted hover:text-white border border-grind-border hover:border-grind-accent/50 font-medium transition-colors",
		danger: "bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-900/50 font-medium hover:text-red-300",
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`
        px-4 py-3 rounded-xl text-sm transition-all duration-300
        active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2
        ${variants[variant]} ${className}
        `}
		>
			{children}
		</button>
	);
}
