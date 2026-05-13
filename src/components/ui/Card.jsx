export function Card({ children, className = "", onClick }) {
	return (
		<div
		onClick={onClick}
		className={`
            bg-gradient-to-br from-[#141414] to-[#0f0f0f] border border-grind-border/50 rounded-2xl p-5
            shadow-md hover:shadow-lg transition-all duration-300
            ${onClick ? "cursor-pointer hover:border-grind-accent/30 active:scale-[0.98]" : ""}
            ${className}
        `}
		>{children}</div>
	);
}
