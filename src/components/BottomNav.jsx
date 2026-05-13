import { NavLink } from "react-router-dom";

const navItems = [
	{ to: "/", label: "Home", icon: "⚡" },
	{ to: "/routines", label: "Routines", icon: "📋" },
	{ to: "/library", label: "Library", icon: "💪" },
	{ to: "/log", label: "Log", icon: "▶" },
	{ to: "/stats", label: "Stats", icon: "📊" },
];

export function BottomNav() {
	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-grind-border/30 z-40">
			<div className="flex items-center justify-around py-3 pb-safe max-w-lg mx-auto">
				{navItems.map(({ to, label, icon }) => (
					<NavLink
						key={to}
						to={to}
						end={to === "/"}
						className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 text-xs
              ${
							isActive
								? "text-grind-accent scale-110 drop-shadow-[0_0_10px_rgba(200,255,0,0.3)]"
								: "text-grind-muted hover:text-white hover:scale-105"
						}
            `}
					>
						<span className="text-2xl">{icon}</span>
						<span className="font-body font-semibold text-[10px]">{label}</span>
					</NavLink>
				))}
			</div>
		</nav>
	);
}
